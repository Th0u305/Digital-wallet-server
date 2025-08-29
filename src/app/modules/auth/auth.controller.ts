import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus  from "http-status-codes";
import AppError from "../../errorHelper/AppError";
import { createNewAccessTokenWithRefreshToken, createUserToken } from "../../utils/user.token";
import { setAuthCookie } from "../../utils/setCookie";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";

const credentialsLogin = catchAsync( async ( req: Request, res: Response, next : NextFunction)=>{

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async(err: any, user: any, info: any)=>{

        if (err) {
            return next(new AppError(401, err))
        }

        if (!user) {
            return next(new AppError(401,info.message))
        }

        const userToken = await createUserToken(user)

        setAuthCookie(res, userToken)

        sendResponse(res,{
            success : true,
            statusCode : httpStatus.OK,
            message : "User logged in successfully",
            data : {
                accessToken : userToken.accessToken,
                refreshToken : userToken.refreshToken,
                user : user
            }
        })

    })(req,res,next)

})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken = catchAsync( async ( req: Request, res: Response, next : NextFunction)=>{

    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies")
    }

    const tokenInfo =  await createNewAccessTokenWithRefreshToken(refreshToken)

    await setAuthCookie(res, tokenInfo)

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "New access token retrieved successfully successfully",
        data : tokenInfo
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logout = catchAsync( async ( req: Request, res: Response, next : NextFunction)=>{

    res.clearCookie("accessToken", {
        httpOnly : true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site, 'lax' for localhost
    })

    res.clearCookie("refreshToken", {
        httpOnly : true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site, 'lax' for localhost
    })

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "You logged out successfully",
        data : null
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword = catchAsync( async ( req: Request, res: Response, next : NextFunction)=>{

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword
    const decodedToken = req.user

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload)

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "Password changed successfully",
        data : null
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const changePassword = catchAsync( async ( req: Request, res: Response, next : NextFunction)=>{

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword
    const decodedToken = req.user

    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload)

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "Password changed successfully",
        data : null
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const setPassword = catchAsync( async ( req: Request, res: Response, next : NextFunction)=>{

    const {password} = req.body
    const decodedToken = req.user as JwtPayload

    await AuthServices.setPassword(decodedToken as JwtPayload, password)

    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "Password changed successfully",
        data : null
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { email } = req.query;

    const result = await AuthServices.forgotPassword(email as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Email Sent Successfully",
        data: result,
    })
})



// eslint-disable-next-line @typescript-eslint/no-unused-vars
const googleCallbackController = catchAsync( async ( req: Request, res: Response, next : NextFunction)=>{

    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

    const user = req.user

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    const tokenInfo = createUserToken(user)

    setAuthCookie(res, tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})

export const AuthController = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController,
    changePassword,
    setPassword,
    forgotPassword
}