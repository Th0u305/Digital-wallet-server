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
import { WalletStatus } from "./wallet.interface"

// add money
const addMoney = async (payload: Partial<ITransaction>, decodedToken: JwtPayload) =>{

    const { amount, transactionType: payloadTrans } = payload
    const {_id, role} = decodedToken

    if (!amount) {
        return { success: false, message: "Amount is missing" }
    }

    let isUserExists 

    if (role === Role.AGENT) {
        isUserExists = await Agent.findById({_id})    
    }
    else{
        isUserExists = await User.findById({_id})
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

        if (wallet.walletStatus !== WalletStatus.ACTIVE) {
            return { success : false, message :  `Your wallet is ${wallet.walletStatus?.toLocaleLowerCase()} . Please consult with admin` }
        }

        if (payload.transactionType !== TransactionType.ADD_MONEY){

            return { success : false , message : "You cannot perform this action"}

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

// agent send money to any & user "CASH_OUT" ,"SEND_MONEY"
const moneyActions = async (paramsId : string , amount : number , transType : string , decodedToken : JwtPayload) =>{

    if (!paramsId) {
        throw new AppError(httpStatus.NOT_FOUND, "Id missing")
    }
    if (!amount) {
        throw new AppError(httpStatus.NOT_FOUND, "Amount is missing")   
    }
    if (!transType) {
        throw new AppError(httpStatus.NOT_FOUND, "TransactionType is missing")   
    }

    if (transType === TransactionType.ADD_MONEY) {
        throw new AppError(httpStatus.FORBIDDEN, "You cannot perform this action")
    }

    let senderUser 

    let receiverUser = await User.findById(paramsId) 
    let receiverWallet


    if (decodedToken.role === Role.AGENT) {
        senderUser = await Agent.findById(decodedToken._id)   
    }

    if (decodedToken.role !== Role.AGENT) {
        senderUser = await User.findById(decodedToken._id)
    }

    if (!receiverUser) {
        receiverUser = await Agent.findById(paramsId) 
        receiverWallet = await Wallet.findById(receiverUser?.walletId)
    }

    if (receiverUser?.role === Role.AGENT && senderUser?.role === Role.USER) {
        throw new AppError(httpStatus.BAD_REQUEST, `User cannot ${transType.toLowerCase()} to agent`)
    }
    
    if (!senderUser) {
        throw new AppError (httpStatus.NOT_FOUND, "This user account doesn't exists")
    }

    const senderWallet = await Wallet.findById(senderUser?.walletId)

    if (!senderWallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user Wallet not found or does not belong to the user.')
    }

    if (senderWallet.walletStatus !== WalletStatus.ACTIVE) {
        throw new AppError(httpStatus.FORBIDDEN, `Your account is ${senderWallet.walletStatus?.toLocaleLowerCase()} . Please consult with admin`)
    }

    if (!receiverUser) {
        throw new AppError (httpStatus.NOT_FOUND, "Receiver account doesn't exists")
    }
    if (!receiverWallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'Receiver account Wallet not found or does not belong to the user.')
    }

    if (receiverWallet.walletStatus !== WalletStatus.ACTIVE) {
        throw new AppError(httpStatus.FORBIDDEN, `Receiver account is ${receiverWallet.walletStatus?.toLocaleLowerCase()} . Please consult with admin`)
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
                status : transType === TransactionType.SEND_MONEY ? PAYMENT_STATUS.SEND : PAYMENT_STATUS.COMPLETED,
                transactionType : transType,
                sendMoney : {
                    amount : amount,
                    receiverId : paramsId,
                    senderId : senderUser._id,
                    senderRole : senderUser.role,
                    message :  `An ${senderUser.role.toLocaleLowerCase()} Successfully ${transType.toLocaleLowerCase()} ${amount} money to ${receiverUser.role.toLocaleLowerCase()}`
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

    let isUserExists 

    if (decodedToken.role === Role.AGENT) {

       isUserExists = await Agent.findById(decodedToken._id)

    }else{

        isUserExists = await User.findById(decodedToken._id)
    }

    if (!isUserExists) {
        throw new AppError (httpStatus.NOT_FOUND, "This user doesn't exists")
    }

    const userWallet = await Wallet.findById(isUserExists?.walletId)

    if (!userWallet) {
        throw new AppError(httpStatus.NOT_FOUND, ' Wallet not found or does not belong to the user.')
    }
    if (userWallet.walletStatus !== WalletStatus.ACTIVE) {
        throw new AppError(httpStatus.FORBIDDEN, `Your account is ${userWallet.walletStatus?.toLocaleLowerCase()} . Please consult with admin`)
    }

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
    moneyActions,
    transactionHistory
}