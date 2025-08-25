import { Router } from "express";
import { AuthController } from "./auth.controller";
import checkAuth from "../../middleware/check.auth";
import { Role } from "../user/user.interface";
import googlePassportAuthenticate from "../../middleware/googlePassportAuthenticate";
import passport from "passport";

export const AuthRoutes = Router()

AuthRoutes.post("/login", AuthController.credentialsLogin)
AuthRoutes.post("/refresh-token", AuthController.getNewAccessToken)
AuthRoutes.post("/logout", AuthController.logout)
AuthRoutes.post("/change-password", checkAuth(...Object.values(Role)) , AuthController.changePassword)
AuthRoutes.post("/reset-password", checkAuth(...Object.values(Role)) , AuthController.resetPassword)
AuthRoutes.post("/set-password", checkAuth(...Object.values(Role)) , AuthController.setPassword)
AuthRoutes.post("/forgot-password", AuthController.forgotPassword)
AuthRoutes.get("/google",googlePassportAuthenticate())
AuthRoutes.get("/google/callback", passport.authenticate("google", {failureRedirect : "/login"}) , AuthController.googleCallbackController)