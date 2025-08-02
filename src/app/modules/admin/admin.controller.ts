import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AdminService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status-codes"

const getData = catchAsync(async(req: Request, res: Response)=>{

    const result = await AdminService.getAggregatedData(req)
    
    sendResponse(res,{
        statusCode: httpStatus.OK,
        success : true,
        message : "Retrieved data successfully retrieved",
        data : result,
    })
})

const walletAction = catchAsync(async(req: Request, res: Response)=>{

    const { action, userId } = req.params

    const result = await AdminService.walletAction(action as string , userId as string)
    
    sendResponse(res,{
        success : result.success === false ? false : true,
        statusCode : result.success === false ? httpStatus.BAD_REQUEST : httpStatus.OK,
        message : result.message ? result.message : `Successfully ${req.query.action} an user or agent`,
        data : result
    })
})


export const AdminController = {
    getData,
    walletAction
}