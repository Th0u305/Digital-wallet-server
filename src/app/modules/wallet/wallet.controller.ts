import httpStatus from "http-status-codes"
import catchAsync from "../../utils/catchAsync"
import { Request, Response } from "express"
import { JwtPayload } from "jsonwebtoken"
import { WalletService } from "./wallet.service"
import sendResponse from "../../utils/sendResponse"


const addMoney = catchAsync( async(req:Request, res:Response)=>{
    const data = req.body
    const verifiedToken = req.user  
      
    const result = await WalletService.addMoney(data, verifiedToken as JwtPayload)

    sendResponse(res,{
        success : result.success === false ? false : true,
        statusCode : result.success === false ? httpStatus.BAD_REQUEST : httpStatus.CREATED,
        message : result.message ? result.message : "Transaction completed",
        data : result
    })
})

// send money 
const sendMoney = catchAsync( async (req: Request, res:Response)=>{

    const paramsId = req.params.id
    const decodedToken = req.user
    const { amount , transactionType } = req.body

    const result = await WalletService.sendMoney(paramsId, amount, transactionType , decodedToken as JwtPayload)

    sendResponse(res,{
        success : result.success === false ? false : true,
        statusCode : result.success === false ? httpStatus.BAD_REQUEST : httpStatus.OK,
        message : result.message ? result.message : "Successfully send money",
        data : result
    })
})

// view transaction history
const transactionHistory = catchAsync( async( req:Request, res:Response)=>{
    const decodedToken = req.user

    const result = await WalletService.transactionHistory(decodedToken as JwtPayload)

    sendResponse(res,{
        success: true,
        statusCode : httpStatus.OK,
        message : "Successfully retrieved transaction history",
        data : result.data,
        meta : result.count
    })
})

export const WalletController = {
    addMoney,
    sendMoney,
    transactionHistory
}