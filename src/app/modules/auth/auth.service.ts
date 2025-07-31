import AppError from "../../errorHelper/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";
import { Encrypt } from "../../utils/encrypt";
import { Agent } from "../agent/agent.model";
import { Role } from "../user/user.interface";

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) =>{

    if (decodedToken.role === Role.AGENT) {
        const agent = await Agent.findById(decodedToken._id)    

        const isOldPasswordMatch = await Encrypt.compare(oldPassword, agent?.password as string)

        if (!isOldPasswordMatch) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Your password does not match");
        }
    
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        agent!.password = await Encrypt.hashPassword(newPassword as string)
        agent?.save()    
    }

    else if (decodedToken.role !== Role.AGENT){
        const user = await User.findById(decodedToken._id)

        const isOldPasswordMatch = await Encrypt.compare(oldPassword, user?.password as string)

        if (!isOldPasswordMatch) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Your password does not match");
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        user!.password = await Encrypt.hashPassword(newPassword as string)
        user?.save()
    }
}

export const AuthServices = {
    resetPassword
}