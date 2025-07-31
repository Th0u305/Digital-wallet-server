import { Request, Response } from "express"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import { AgentServices } from "./agent.service"


// get all user
const getAllAgent = catchAsync(async (req: Request , res: Response)=>{

    const result = await AgentServices.getAllAgent()

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "All agents retrieved successfully",
        data : result.data,
        meta : result.meta
    })
})

// create user
const createAgent = catchAsync(async(req:Request, res:Response)=>{
    const result = await AgentServices.createAgentWithWallet(req.body)
    
    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "User created successfully",
        data : result
    })
})

// update user
const updateAgent = catchAsync( async(req:Request, res:Response)=>{
    const userId = req.params.id
    const verifiedToken = req.user    
    const payload = req.body
    
    const result = await AgentServices.updateAgent(userId, payload, verifiedToken as JwtPayload, res)

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.CREATED,
        message : "User updated successfully",
        data : result
    })
})


export const AgentController = {
    getAllAgent,
    createAgent,
    updateAgent
}