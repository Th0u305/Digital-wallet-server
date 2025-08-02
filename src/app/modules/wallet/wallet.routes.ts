import { Router } from "express";
import checkAuth from "../../middleware/check.auth";
import { Role } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { sendMoney, transactionZodValidation } from "../transactions/transactions.validation";
import { WalletController } from "./wallet.controller";

export const WalletRoutes = Router()

WalletRoutes.get("/transactionHistory", checkAuth("USER", "AGENT"), WalletController.transactionHistory)
WalletRoutes.post("/add-money", checkAuth(...Object.values(Role)), validateRequest(transactionZodValidation), WalletController.addMoney)
WalletRoutes.post("/moneyActions/:id", checkAuth(...Object.values(Role)), validateRequest(sendMoney), WalletController.moneyActions)