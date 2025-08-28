import { Router } from "express";
import { UserController } from "./user.controller";
import checkAuth from "../../middleware/check.auth";
import validateRequest from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { Role } from "./user.interface";

export const UserRoutes = Router()

UserRoutes.post("/register", validateRequest(createUserZodSchema), UserController.createUser)
UserRoutes.patch("/update-user/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)) , UserController.updateUser)
UserRoutes.get("/me", checkAuth(...Object.values(Role)), UserController.getMe)
