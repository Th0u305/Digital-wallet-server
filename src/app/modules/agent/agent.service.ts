import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelper/AppError"
import { Encrypt } from "../../utils/encrypt"
import httpStatus from "http-status-codes"
import { Response } from "express"
import { Agent } from "./agent.model"
import { AgentProfile, IAgent } from "./agent.interface"
import { IAuthProvider, Role } from "../user/user.interface"


// get all user
const getAllAgent = async () =>{
    const users = await Agent.find({})
    const totalUsers = await Agent.countDocuments()
    return {
        data : users,
        meta : {
            total : totalUsers
        }
    }
}

// create user
const createAgent = async (payload: Partial<IAgent>) =>{
    const { email, password, agentInfo, ...rest} = payload
    const isUserExist = await Agent.findOne({email})

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "This Agent already exists")
    }

    if (!agentInfo?.nidNumber) {
        throw new AppError(httpStatus.BAD_REQUEST, "NID number is required")
    }

    const hashedPassword = await Encrypt.hashPassword(password as string)    
    const authProvider: IAuthProvider = { provider: "credentials", providerId : email as string}
    const agentDetails : AgentProfile = { nidNumber :  agentInfo?.nidNumber as string, commissionRate : agentInfo?.commissionRate as number , tradeLicenseNumber : agentInfo?.tradeLicenseNumber as string}
    const user = await Agent.create({
        email,
        password: hashedPassword,
        auths : authProvider,
        agentInfo : agentDetails,
        ...rest
    })
    return user
}

// update user
const updateAgent = async (userId: string, payload: Partial<IAgent>, decodedToken: JwtPayload, res:Response) =>{

    const isUserExists = await Agent.findById(userId)
    
    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found")
    }

    if (decodedToken._id !== userId || isUserExists?._id.toString() !== userId) {
        res.clearCookie("accessToken", {
          httpOnly : true,
          secure : false,
          sameSite : "lax"
        })
        res.clearCookie("refreshToken", {
          httpOnly : true,
          secure : false,
          sameSite : "lax"
        })
        throw new AppError(httpStatus.FORBIDDEN , "You're not authorized to perform this action")
    }
    

    if (payload.role) {
        if (decodedToken.role !== Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You're not authorized to perform this action")
        }
        if (payload.role && decodedToken.role !== Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You're not authorized to perform this action")
        }
    }


    let hasChanges = false

    for (const fieldsData in payload ) {
        if (payload[fieldsData as keyof IAgent] !== isUserExists[fieldsData as keyof IAgent]) {
            hasChanges = true
            break
        }
    }

    if (!hasChanges) {
        throw new AppError(httpStatus.BAD_REQUEST, "No changes detected. Please provide new data to update.")
    }

    const newUpdateUser = await Agent.findByIdAndUpdate(userId, payload , {new: true, runValidators : true}).select("-password")
    return newUpdateUser

}

export const AgentServices = {
    getAllAgent,
    createAgent,
    updateAgent
}