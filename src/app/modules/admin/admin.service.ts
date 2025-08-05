import mongoose, { Model, PipelineStage } from "mongoose";
import { Agent } from "../agent/agent.model"
import { User } from "../user/user.model"
import { Request } from "express";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status-codes"
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transactions/transactions.model";
import z from "zod";
import { WalletStatus } from "../wallet/wallet.interface";

const querySchema = z.object({
    view: z.enum(['user', 'agent', 'wallet', 'transaction']),
    filterBy: z.enum(['wallet', 'transaction', 'all']).optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.preprocess(val => parseInt(String(val), 10) || 10, z.number().min(1)),
    page: z.preprocess(val => parseInt(String(val), 10) || 1, z.number().min(1)),
});



export const getAggregatedData = async (req: Request) => {

    const validatedQuery = querySchema.parse(req.query);

    const { view, filterBy, sortBy, sortOrder, limit, page } = validatedQuery;

    const skip = (page - 1) * limit;
    

    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/no-explicit-any
    const modelMap: { [key: string]: Model<any> } = {
        user: User,
        agent: Agent,
        wallet: Wallet,
        transaction: Transaction,
    };
    const Model = modelMap[view as string];


    const pipeline: PipelineStage[] = [];


    if (view === 'user' || view === 'agent') {
        pipeline.push(
            {
                $lookup: {
                    from: 'wallets',
                    localField: 'walletId',
                    foreignField: '_id',
                    as: 'walletData',
                },
            },
            { $unwind: { path: '$walletData', preserveNullAndEmptyArrays: true } }
        );

        pipeline.push({
            $lookup: {
                from: 'transactions',
                localField: 'walletData.transactionId',
                foreignField: '_id',
                as: 'allTransactions',
            },
        });
    } else if (view === 'wallet') {
         pipeline.push({
            $lookup: {
                from: 'transactions',
                localField: 'transactionId',
                foreignField: '_id',
                as: 'allTransactions',
            },
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectStage: Record<string, any> = {};
    if (filterBy === 'wallet') {
        projectStage.allTransactions = 0; // Hide transactions
    } else if (filterBy === 'transaction') {
        projectStage.walletData = 0; // Hide wallet data
    }
    
    // Only add the project stage if there's something to project
    if (Object.keys(projectStage).length > 0) {
        pipeline.push({ $project: projectStage });
    }

    pipeline.push({
        $facet: {
            // First pipeline: get metadata (total count)
            metadata: [{ $count: 'total' }],
            // Second pipeline: get the actual paginated data
            data: [
                { $sort: { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skip },
                { $limit: limit || 10 },
            ],
        },
    });

    const result = await Model.aggregate(pipeline);

    const data = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
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

    if (action.toUpperCase() !== WalletStatus.ACTIVE && action.toUpperCase() !== WalletStatus.SUSPENDED && action.toUpperCase() !== WalletStatus.BLOCKED) {
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