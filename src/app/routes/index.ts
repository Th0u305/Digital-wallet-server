import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { AgentRoutes } from "../modules/agent/agent.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { OtpRoutes } from "../modules/otp/otp.routes";

export const customRouter = Router();
const moduleRoutes = [
  {
    path: "/user",
    route : UserRoutes
  },
  {
    path: "/auth",
    route : AuthRoutes
  },
  {
    path : "/agent",
    route : AgentRoutes
  },
  {
    path : "/wallet",
    route : WalletRoutes
  },
  {
    path: "/admin",
    route : AdminRoutes
  },
  {
    path : "/otp",
    route : OtpRoutes
  }
];

moduleRoutes.forEach((route) => {
  customRouter.use(route.path, route.route);
});
