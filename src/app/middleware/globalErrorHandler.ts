/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelper/AppError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  let statusCode = 500
  let message = `Something went wrong!!`
  const errorSources: any = []

  // duplicate error
  if (err.code === 11000) {
    const matchArray = err.message.match(/"([^"]*)"/)
    statusCode = 400
    message = `${matchArray[1]} already exists!!`
  }

  // ObjectID error / cast Error
  else if (err.name === "CastError"){
    statusCode = 400
    message = "Invalid MongoDB ObjectID. Please provide a valid id"
  }

  // Zod error
  else if (err.name === "ZodError") {
    statusCode = 400
    message = "Zod Error"
    err?.issues?.forEach((issue: any)=>{
      errorSources.push({
        path : issue.path[issue.path.length - 1],
        // path : issue.path.length > 1 && issue.path.reverse().join("inside"),
        message : issue.message
      })
    })
  }

  // Mongoose validation error
  else if (err.name === "ValidationError") {
    statusCode = 400
    const errors = Object.values(err.errors)
    errors?.forEach((errorObject: any)=> errorSources.push({
      path : errorObject.path,
      message : errorObject.message
    }))
    message = err.message
  }

  else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  }else if (err instanceof Error){
    statusCode = 500
    message = err.message
  }
  
  res.status(500).json({
    success: false,
    message,
    errorSources,
    err : envVars.NODE_ENV === "development" ? err: null, 
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
