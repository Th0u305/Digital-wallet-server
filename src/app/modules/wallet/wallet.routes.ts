import { Router } from "express";
import checkAuth from "../../middleware/check.auth";
import { Role } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { sendMoneyUserToUser, transactionZodValidation } from "../transactions/transactions.validation";
import { WalletController } from "./wallet.controller";

export const WalletRoutes = Router()

WalletRoutes.get("/transactionHistory", checkAuth(...Object.values(Role)), WalletController.transactionHistory)
WalletRoutes.post("/add-money", checkAuth(...Object.values(Role)), validateRequest(transactionZodValidation), WalletController.addMoney)
WalletRoutes.post("/send-money/:id", checkAuth(...Object.values(Role)), validateRequest(sendMoneyUserToUser), WalletController.sendMoney)