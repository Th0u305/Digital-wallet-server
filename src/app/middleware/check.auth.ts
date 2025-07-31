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

    const accessToken = req.headers.authorization
    
    if (!accessToken) {
      throw new AppError(403, "No token Received");
    }

    const verifiedToken = verifyToken(accessToken,envVars.JWT_ACCESS_SECRET) as JwtPayload;
    let isUserExist
    
    if (verifiedToken.role === Role.AGENT) {
      isUserExist = await Agent.findOne({_id : verifiedToken._id})
          if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
    }
    }
    else if (verifiedToken.role !== Role.AGENT) {
      isUserExist = await User.findOne({_id : verifiedToken._id})
          if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
    }
    }
  
      
    if (isUserExist?.isActive !== IsActive.ACTIVE) {
      throw new AppError(httpStatus.BAD_REQUEST, `This account is ${isUserExist?.isActive}`)
    }

    if (isUserExist?.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, "This account is deleted")
    }

    if (!authRoles.includes(verifiedToken.role)) {
      throw new AppError(403, "You are not permitted to view this route");
    }

    req.user = verifiedToken   
    next();

  } catch (error) {
    next(error);
  }
};
export default checkAuth;
