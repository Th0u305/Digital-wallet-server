import { ITransaction, PAYMENT_STATUS, TransactionType } from "../transactions/transactions.interface"
import { JwtPayload } from "jsonwebtoken"
import { User } from "../user/user.model"
import { Transaction } from "../transactions/transactions.model"
import { Wallet } from "./wallet.model"
import mongoose from "mongoose"
import { Role } from "../user/user.interface"
import { Agent } from "../agent/agent.model"
import AppError from "../../errorHelper/AppError"
import httpStatus from "http-status-codes"

// Money transactions
const addMoney = async (payload: Partial<ITransaction>, decodedToken: JwtPayload) =>{

    const { amount, transactionType: payloadTrans } = payload
    const {email, role} = decodedToken

    if (!amount) {
        return { success: false, message: "Amount is missing" }
    }

    let isUserExists 

    if (role === Role.AGENT) {
        isUserExists = await Agent.findOne({email})    
    }
    else{
        isUserExists = await User.findOne({email})
    }

    if (!isUserExists) {
        return { success: false, message: "User not found" }
    }    
    
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const wallet = await Wallet.findById({ _id: isUserExists.walletId }).session(session);

        if (!wallet) {
            return { success: false, message: 'Wallet not found or does not belong to the user.' }
        }

        if (payload.transactionType === TransactionType.SEND_MONEY){

            return { success : false , message : "You cannot perform this action"}

        }else if (payload.transactionType !== TransactionType.ADD_MONEY) {

            if (wallet.balance < amount) {
                return { success: false, message: 'Insufficient funds for this operation.' }
            }
            wallet.balance -= amount;

        }else if (payload.transactionType === TransactionType.ADD_MONEY) {
            wallet.balance += amount;
        }

        const transactionData = new Transaction(
            {
                userId : isUserExists._id,
                walletId : isUserExists.walletId,
                userModel : isUserExists.role.toLowerCase(),
                amount : amount,
                status : PAYMENT_STATUS.COMPLETED,
                transactionType : payloadTrans,
            }
        )

        await transactionData.save({session})

        if (!wallet.transactionId) {
            wallet.transactionId = []; // Initialize if it doesn't exist
        }

        wallet.transactionId.push(transactionData._id)

        await wallet.save({session})

        await session.commitTransaction()

        return transactionData

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {

        await session.abortTransaction()
        return { success: false, message:  `Transaction failed: ${error.message}` }

    }finally{
        session.endSession()
    }    
}

interface pay {
    amount : number
}

const sendMoneyUserToUser = async (paramsId : string , payload: pay, decodedToken : JwtPayload) =>{

    const { amount } = payload

    if (!paramsId) {
        throw new AppError(httpStatus.NOT_FOUND, "Receiver id missing")
    }
    if (!amount) {
        throw new AppError(httpStatus.NOT_FOUND, "Amount is missing")   
    }

    const receiverUser = await User.findById(paramsId)
    const receiverWallet = await Wallet.findById(receiverUser?.walletId)

    if (!receiverUser) {
        throw new AppError (httpStatus.NOT_FOUND, "Receiver account doesn't exists")
    }
    if (!receiverWallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'Receiver account Wallet not found or does not belong to the user.')
    }

    const senderUser = await User.findById(decodedToken._id)
    const senderWallet = await Wallet.findById(senderUser?.walletId)

    if (!senderUser) {
        throw new AppError (httpStatus.NOT_FOUND, "This account doesn't exists")
    }
    if (!senderWallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'This Wallet not found or does not belong to the user.')
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (senderWallet.balance < amount) {
            return { success: false, message: 'Insufficient funds for this operation.' }
        }
        senderWallet.balance -= amount;
        
        const transactionData = new Transaction(
            {
                userId : senderUser._id,
                walletId : senderUser.walletId,
                userModel : senderUser.role.toLowerCase(),
                amount : amount,
                status : PAYMENT_STATUS.SEND,
                transactionType : TransactionType.SEND_MONEY,
                sendMoney : {
                    amount : amount,
                    receiverId : paramsId,
                    senderId : senderUser._id,
                    message :  `Successfully send ${amount} money`
                }
            }
        )

        await transactionData.save({session})

        receiverWallet.balance += amount
        senderWallet.transactionId?.push(transactionData._id)
        
        await senderWallet.save({session})
        await receiverWallet.save({session})

        await session.commitTransaction()

        return transactionData

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {

        await session.abortTransaction()
        return { success: false, message:  `Transaction failed: ${error.message}` }
        
    }finally{
        session.endSession()
    }
  
    


}


const transactionHistory =  async(decodedToken: JwtPayload)=>{

    const isUserExists = await User.findById(decodedToken._id)
    const userWallet = await Wallet.findById(isUserExists?.walletId)

    if (!isUserExists) {
        throw new AppError (httpStatus.NOT_FOUND, "This user doesn't exists")
    }
    if (!userWallet) {
        throw new AppError(httpStatus.NOT_FOUND, ' Wallet not found or does not belong to the user.')
    }

    // console.log(userWallet.transactionId);

    const history = await Transaction.find({_id : { $in : userWallet.transactionId}})
    const count = await Transaction.find({_id : { $in : userWallet.transactionId}}).countDocuments()
    
    return {
        data : history,
        count : {
            total : count
        }
    }
    

}

export const WalletService = {
    addMoney,
    sendMoneyUserToUser,
    transactionHistory
}