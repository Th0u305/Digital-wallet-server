import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail";
import { User } from "../user/user.model";
import AppError from "../../errorHelper/AppError";
import { redisClient } from "../../config/redis.config";
import { Model } from "mongoose";
import httpStatus from "http-status-codes"
import { Agent } from "../agent/agent.model";


const OTP_EXPIRATION = 2 * 60 // 2minute

const generateOtp = (length = 6) => {
    //6 digit otp
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

    // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000

    return otp
}

const sendOTP = async (email: string, name: string , role: string) => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Model: Model<any>;

        switch (role) {
        case 'USER':
            Model = User;
            break;
        case 'AGENT':
            Model = Agent
            break;
        case 'ADMIN':
            Model = User
            break;
        default:
            throw new AppError(httpStatus.BAD_REQUEST, 'Invalid role specified.');
    }

    const user = await Model.findOne({ email })

    if (!user) {
        throw new AppError(404, "User not found")
    }

    if (user.isVerified) {
        throw new AppError(401, "You are already verified")
    }
    const otp = generateOtp();

    const redisKey = `otp:${email}`

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp
        }
    })
};

const verifyOTP = async (email: string, otp: string) => {
    // const user = await User.findOne({ email, isVerified: false })
    const user = await User.findOne({ email })

    if (!user) {
        throw new AppError(404, "User not found")
    }

    if (user.isVerified) {
        throw new AppError(401, "You are already verified")
    }

    const redisKey = `otp:${email}`

    const savedOtp = await redisClient.get(redisKey)

    if (!savedOtp) {
        throw new AppError(401, "Invalid OTP");
    }

    if (savedOtp !== otp) {
        throw new AppError(401, "Invalid OTP");
    }


    await Promise.all([
        User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redisClient.del([redisKey])
    ])

};

export const OTPService = {
    sendOTP,
    verifyOTP
}