import { Router } from "express";
import checkAuth from "../../middleware/check.auth";
import { AdminController } from "./admin.controller";

export const AdminRoutes = Router()

AdminRoutes.get("/getData", checkAuth("SUPER_ADMIN"), AdminController.getData)
AdminRoutes.patch("/walletAction/:action/:userId", checkAuth("ADMIN", "SUPER_ADMIN"), AdminController.walletAction)