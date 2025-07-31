import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../config/env"
import { IsActive, IUser } from "../modules/user/user.interface"
import { generateToken, verifyToken } from "./jwt"
import { User } from "../modules/user/user.model"
import AppError from "../errorHelper/AppError"
import httpStatus from "http-status-codes"

export const createUserToken = (user : Partial<IUser>) =>{

    const jwtPayload = {
        _id : user._id,
        email : user.email,
        role : user.role
    }
    
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    return {
        accessToken,
        refreshToken
    }
}

export const createNewAccessTokenWithRefreshToken = async ( refreshToken : string) =>{

    const verifyRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload
    
    const isUserExist = await User.findOne({email: verifyRefreshToken.email})

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
    }

    if (isUserExist.isActive !== IsActive.ACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `This user is ${isUserExist.isActive}`)
    }

    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "This account has been deleted")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email : isUserExist.email,
        role : isUserExist.role
    }  

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return{
        accessToken
    }
}
