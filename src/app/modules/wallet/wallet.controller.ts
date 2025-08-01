import httpStatus from "http-status-codes"
import catchAsync from "../../utils/catchAsync"
import { Request, Response } from "express"
import { JwtPayload } from "jsonwebtoken"
import { WalletService } from "./wallet.service"
import sendResponse from "../../utils/sendResponse"


const addMoney = catchAsync( async(req:Request, res:Response)=>{
    const data = req.body
    const verifiedToken = req.user  
      
    const result = WalletService.addMoney(data, verifiedToken as JwtPayload)

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.CREATED,
        message : "Transaction complete",
        data : result
    })
})

export const WalletController = {
    addMoney
}