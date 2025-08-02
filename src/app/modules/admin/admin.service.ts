import mongoose, { Model } from "mongoose";
import { Agent } from "../agent/agent.model"
import { User } from "../user/user.model"
import { Request } from "express";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status-codes"
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transactions/transactions.model";
import { WalletStatus } from "../wallet/wallet.interface";


const getAggregatedData = async (req:Request) => {

    const { view, filterBy, sortBy, limit } = req.query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Model: Model<any>;

    let result
    let count 

    switch (view) {
        case 'user':
            Model = User;
            break;
        case 'agent':
            Model = Agent
            break;
        case "transaction": 
            Model = Transaction
            break
        case "wallet":
            Model = Wallet
            break
        default:
            throw new AppError(httpStatus.BAD_REQUEST, 'Invalid view specified.');
    }

    const isWallet = {
    
        $lookup: {
            from: "wallets",
            localField: "walletId", // The ID on the Agent document
            foreignField: "_id",     // The ID on the Wallet document
            as: "walletData"
        }
    }

    const isTransaction = {

        $lookup: {
            from: "transactions",
            localField: view === "wallet" ? "transactionId" : "walletData.transactionId", // The array of IDs from the wallet
            foreignField: "_id",   // The ID on each transaction document
            as: "allTransactions"  // This creates the new array with the full transaction documents
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortCriteria: any = {};
    sortCriteria[sortBy as string] = -1;
    
    const isLimit = { $limit: Number(limit) }

    if (view === "wallet" || (view === "transaction" && filterBy === "wallet")) {

        result = await Model.aggregate(
            [
                isWallet,
                isTransaction,
                isLimit,
            ]
        ).sort(sortCriteria)
        count = result.length
    }

    if (!filterBy) {
        result = await Model.find().sort(sortCriteria)
        count = result.length
    }
    

    const data = {
        count : {
            total : count
        },
        queries : {
            view : view,
            filterBy : filterBy,
            sortBy : sortBy,
            limit : limit
        },
        data : result,
    }

    return data
};

const walletAction = async (action : string , userId: string) => {
    
    let isUserExists 
    isUserExists = await User.findById(userId)
    
    if (!isUserExists) {
        isUserExists = await Agent.findById(userId)
    }
    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "This account doesn't exists")
    }

    if (action.toUpperCase() !== WalletStatus.ACTIVE || action.toUpperCase() !== WalletStatus.SUSPENDED || action.toUpperCase() !== WalletStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Please use a correct wallet action (e.g., ACTIVE, BLOCKED, SUSPENDED)");
    }

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const isWallet = await Wallet.findByIdAndUpdate(
            isUserExists?.walletId,
            { walletStatus : action.toLocaleUpperCase()},
            { new: true, runValidators: true, session}
        )

        if (!isWallet) {
            return { success: false, message: 'This account Wallet not found or does not belong to the user.'}
        }

        await session.commitTransaction()
    
        return isWallet

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {

        await session.abortTransaction()
        return { success: false, message:  `Transaction failed: ${error.message}`}    

    }finally{
            
        session.endSession()
    }   
};

export const AdminService = {
    getAggregatedData,
    walletAction
}