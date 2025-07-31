import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import AuthRoute from "../modules/auth/auth.routes";
import { AgentRoutes } from "../modules/agent/agent.routes";

export const customRouter = Router();
const moduleRoutes = [
  {
    path: "/user",
    route : UserRoutes
  },
  {
    path: "/auth",
    route : AuthRoute
  },
  {
    path : "/agent",
    route : AgentRoutes
  },
];

moduleRoutes.forEach((route) => {
  customRouter.use(route.path, route.route);
});
