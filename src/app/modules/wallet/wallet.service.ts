import AppError from "../../errorHelper/AppError"
import httpStatus from "http-status-codes"
import { ITransaction, PAYMENT_STATUS, TransactionType } from "../transactions/transactions.interface"
import { JwtPayload } from "jsonwebtoken"
import { User } from "../user/user.model"
import { Transaction } from "../transactions/transactions.model"
import { Wallet } from "./wallet.model"
import mongoose from "mongoose"
import { Role } from "../user/user.interface"
import { Agent } from "../agent/agent.model"

const addMoney = async (payload: Partial<ITransaction>, decodedToken: JwtPayload,) =>{

    const { amount, transactionType: payloadTrans } = payload
    const {email, role} = decodedToken

    if (!amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Amount is missing")
    }

    let isUserExists 

    if (role === Role.AGENT) {
        isUserExists = await Agent.findOne({email})    
    }
    else{
        isUserExists = await User.findOne({email})
    }

    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }    
    
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const wallet = await Wallet.findById({ _id: isUserExists.walletId }).session(session);

        if (!wallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found or does not belong to the user.');
        }

        if (payload.transactionType !== TransactionType.ADD_MONEY) {
            if (wallet.balance < amount) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient funds for this operation.');
            }
            wallet.balance -= amount;
        }else if (payload.transactionType === TransactionType.ADD_MONEY) {
            wallet.balance += amount;
        }

        const transactionData = await Transaction.create(
            [
                {
                    userId : isUserExists._id,
                    walletId : isUserExists.walletId,
                    userModel : isUserExists.role.toLowerCase(),
                    amount : amount,
                    status : PAYMENT_STATUS.COMPLETED,
                    transactionType : payloadTrans,
                }
            ],
            {session}
        )

        await wallet.save({session})

        await session.commitTransaction()

        return transactionData[0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {

        await session.abortTransaction()
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Transaction failed: ${error.message}`);
        
    }finally{
        session.endSession()
    }    
}

export const WalletService = {
    addMoney
}