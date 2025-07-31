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

        // delete user.toObject().password 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password : pass , ...rest} = user.toObject()

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
        secure : false,
        sameSite : "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly : true,
        secure : false,
        sameSite : "lax"
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
    googleCallbackController
}