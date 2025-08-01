import { Router } from "express";
import checkAuth from "../../middleware/check.auth";
import { Role } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { transactionZodValidation } from "../transactions/transactions.validation";
import { WalletController } from "./wallet.controller";

export const WalletRoutes = Router()

WalletRoutes.post("/money", checkAuth(...Object.values(Role)), validateRequest(transactionZodValidation), WalletController.addMoney)
// WalletRoutes.post("/send-to-user/:id")