import { Server } from "http";
import { envVars } from "./app/config/env";
import mongoose from "mongoose";
import app from "./app";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
import { connectRedis } from "./app/config/redis.config";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    server = app.listen(envVars.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App is listing on port ${envVars.PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

(async () => {
  await connectRedis()
  await startServer();
  await seedSuperAdmin();
})();

process.on("unhandledRejection", (error) => {
  // eslint-disable-next-line no-console
  console.log("uncaughtException detected ...Server shutting down..", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  // eslint-disable-next-line no-console
  console.log("uncaughtException detected ...Server shutting down..", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("SIGTERM", (error) => {
  // eslint-disable-next-line no-console
  console.log("SIGTERM signal received ...Server shutting down..", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("SIGINT", (error) => {
  // eslint-disable-next-line no-console
  console.log("SIGINT signal received ...Server shutting down..", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
