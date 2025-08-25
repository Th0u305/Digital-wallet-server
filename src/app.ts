import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { customRouter } from "./app/routes";
import expressSession from "express-session";
import passport from "passport";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import "./app/config/passport";
import { envVars } from "./app/config/env";

const app: Application = express();

app.use(
  expressSession({
    secret: envVars.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(cors(
  {
    origin : ["http://localhost:3000", envVars.FRONTEND_URL],
    credentials : true,
    optionsSuccessStatus : 200,
  }
));

app.use("/api/v1", customRouter);
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to digital api backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
