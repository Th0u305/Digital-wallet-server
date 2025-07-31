import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelper/AppError"
import { Encrypt } from "../../utils/encrypt"
import { IAuthProvider, IUser, Role } from "./user.interface"
import { User } from "./user.model"
import httpStatus from "http-status-codes"
import { Response } from "express"


// get all user
const getAllUsers = async () =>{
    const users = await User.find({})
    const totalUsers = await User.countDocuments()
    return {
        data : users,
        meta : {
            total : totalUsers
        }
    }
}

// create user
const createUser = async (payload: Partial<IUser>) =>{
    const { email, password, ...rest} = payload
    const isUserExist = await User.findOne({email})

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exists")
    }
    const hashedPassword = await Encrypt.hashPassword(password as string)    
    const authProvider: IAuthProvider = { provider: "credentials", providerId : email as string}
    
    const user = await User.create({
        email,
        password: hashedPassword,
        auths : authProvider,
        ...rest
    })
    return user
}

// update user
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload, res:Response) =>{

    const isUserExists = await User.findById(userId)
    
    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
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
        if (payload[fieldsData as keyof IUser] !== isUserExists[fieldsData as keyof IUser]) {
            hasChanges = true
            break
        }
    }

    if (!hasChanges) {
        throw new AppError(httpStatus.BAD_REQUEST, "No changes detected. Please provide new data to update.")
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload , {new: true, runValidators : true}).select("-password")
    return newUpdateUser

}

export const UserServices = {
    getAllUsers,
    createUser,
    updateUser
}