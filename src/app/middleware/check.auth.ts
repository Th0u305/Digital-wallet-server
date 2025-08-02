import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes"
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { verifyToken } from "../utils/jwt";
import { Agent } from "../modules/agent/agent.model";

const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

  try {

    const authorizationToken = req.headers.authorization
    const accessToken = req.cookies.accessToken
    
    
    if (!authorizationToken) {
      throw new AppError(403, "No authorizationToken token Received");
    }
    if (!accessToken) {
      throw new AppError(403, "No accessToken token Received");
    }

    const headerVerifiedToken = verifyToken(authorizationToken,envVars.JWT_ACCESS_SECRET) as JwtPayload;
    const accessVerifiedToken = verifyToken(accessToken,envVars.JWT_ACCESS_SECRET) as JwtPayload;

    if (headerVerifiedToken._id !== accessVerifiedToken._id && headerVerifiedToken.email !== accessVerifiedToken.email) {

      throw new AppError(httpStatus.FORBIDDEN, "Token Error")
    }
    
    let isUserExist
    
    if (headerVerifiedToken.role === Role.AGENT) {

      isUserExist = await Agent.findById(headerVerifiedToken._id)

    }else{

      isUserExist = await User.findById(headerVerifiedToken._id)
    }

    if (!isUserExist) {      
      throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
    }
    
    if (isUserExist?.isActive !== IsActive.ACTIVE) {
      throw new AppError(httpStatus.BAD_REQUEST, `This account is ${isUserExist?.isActive}`)
    }

    if (isUserExist?.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, "This account is deleted")
    }

    if (!authRoles.includes(headerVerifiedToken.role)) {
      throw new AppError(403, "You are not permitted to view this route");
    }

    req.user = headerVerifiedToken   
    next();

  } catch (error) {
    next(error);
  }
};
export default checkAuth;
