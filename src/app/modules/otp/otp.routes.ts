// src/modules/otp/otp.routes.ts
import express from "express";
import { OTPController } from "./otp.controller";

export const OtpRoutes = express.Router();

OtpRoutes.post("/send", OTPController.sendOTP);
OtpRoutes.post("/verify", OTPController.verifyOTP);

