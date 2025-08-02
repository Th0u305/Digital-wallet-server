import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { createAgentSchema } from "./agent.validate";
import { AgentController } from "./agent.controller";

export const AgentRoutes = Router()

AgentRoutes.post("/register",validateRequest(createAgentSchema), AgentController.createAgent)