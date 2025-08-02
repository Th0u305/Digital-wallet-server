import { Request, Response } from "express"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import httpStatus from "http-status-codes"
import { AgentServices } from "./agent.service"

// create user
const createAgent = catchAsync(async(req:Request, res:Response)=>{
    const result = await AgentServices.createAgentWithWallet(req.body)
    
    sendResponse(res,{
        success : result.success === false ? false : true,
        statusCode : result.success === false ? httpStatus.BAD_REQUEST : httpStatus.CREATED,
        message : result.message ? result.message : "Agent created successfully",
        data : result
    })
})

export const AgentController = {
    createAgent,
}