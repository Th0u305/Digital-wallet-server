import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { createAgentSchema } from "./agent.validate";
import { AgentController } from "./agent.controller";

export const AgentRoutes = Router()

AgentRoutes.post("/register",validateRequest(createAgentSchema), AgentController.createAgent)
// AgentRoutes.get("/google", (req:Request, res:Response, next:NextFunction) =>
//     {
//         req.session.userRole = "AGENT"; 
//         googlePassportAuthenticate(req, res, next)
//     })
