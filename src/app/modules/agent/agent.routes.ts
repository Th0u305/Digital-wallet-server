import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { createAgentSchema } from "./agent.validate";
import { AgentController } from "./agent.controller";
import checkAuth from "../../middleware/check.auth";

export const AgentRoutes = Router()

AgentRoutes.get("/all-agent", checkAuth("ADMIN", "SUPER_ADMIN"), AgentController.getAllAgent)
AgentRoutes.post("/register",validateRequest(createAgentSchema), AgentController.createAgent)