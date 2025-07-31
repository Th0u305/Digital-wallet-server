import { Router } from "express";
import { AuthController } from "./auth.controller";
import checkAuth from "../../middleware/check.auth";
import { Role } from "../user/user.interface";
import googlePassportAuthenticate from "../../middleware/googlePassportAuthenticate";
import passport from "passport";

const AuthRoute = Router()

AuthRoute.post("/login", AuthController.credentialsLogin)
AuthRoute.post("/refresh-token", AuthController.getNewAccessToken)
AuthRoute.post("/logout", AuthController.logout)
AuthRoute.post("/reset-password", checkAuth(...Object.values(Role)) , AuthController.resetPassword)
AuthRoute.get("/google",googlePassportAuthenticate())
AuthRoute.get("/google/callback", passport.authenticate("google", {failureRedirect : "/login"}) , AuthController.googleCallbackController)

export default AuthRoute