import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelper/AppError"
import { Encrypt } from "../../utils/encrypt"
import { IAuthProvider, IUser, Role } from "./user.interface"
import { User } from "./user.model"
import httpStatus from "http-status-codes"
import { Response } from "express"
import { Wallet } from "../wallet/wallet.model"
import mongoose from "mongoose"


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
const createUserWithWallet = async (payload: Partial<IUser>) =>{
    
    const { email, password, ...rest} = payload

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {            
        throw new AppError(httpStatus.BAD_REQUEST, "User with this email already exists.");
    }
    
    // start user session
    const session = await mongoose.startSession();

    try {

        // Start the transaction
        session.startTransaction();
   
        const hashedPassword = await Encrypt.hashPassword(password as string);
        const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };

        // Create the user 
        const newUser = new User({
            email,
            password: hashedPassword,
            auths: authProvider,
            ...rest
        });

        // Saving the user to the database within the session
        const createdUser = await newUser.save({ session });


        // Create the wallet, linking it to the new user
        const newWallet = await Wallet.create([{
            userId: createdUser._id, // userId
            userModel : "user"
        }], { session });


        //  Update the user with the new wallet's ID 
        createdUser.walletId = newWallet[0]._id; // wallet Id
        await createdUser.save({ session });

        // commit the transaction
        await session.commitTransaction();
        
        return createdUser;
        
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }catch (error) {

        // If any error occurs, abort the entire transaction
        await session.abortTransaction();        
        
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create user and wallet.');

    }finally{

        // Finally, always end the session
        session.endSession();
    }
    
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
    createUserWithWallet,
    updateUser
}