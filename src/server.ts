import http from "http";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import config from "./configs/app.config";
import logger from "./configs/logger.config";
import dbConnect from "./configs/db.config";
import {
  apiErrorHandler,
  notFoundHandler,
} from "./middlewares/Error.middleware";

import tourRoutes from "./routes/Tour.route";
import userRoutes from "./routes/User.route";
import reviewRoutes from "./routes/Review.route";

const app = express();
const httpServer: ReturnType<typeof http.createServer> = http.createServer(app);

logger.info("================================================================");
logger.info("Initializing API");
logger.info("================================================================");
app.use(morgan(config.ENV === "development" ? "dev" : "default"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

logger.info("================================================================");
logger.info("Configuration");
logger.info("================================================================");
app.use(helmet());
app.use(rateLimit({ limit: 100, windowMs: 60 * 60 * 1000 }));
app.use(cors());
app.use(cookieParser());

logger.info("================================================================");
logger.info("Define Controller Routing");
logger.info("================================================================");
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

logger.info("================================================================");
logger.info("Define Routing Error");
logger.info("================================================================");
app.use(notFoundHandler);
app.use(apiErrorHandler);

dbConnect()
  .then(() => {
    httpServer.listen(config.PORT, () => {
      logger.info(`App running on ${config.HOST}:${config.PORT}`);
    });
  })
  .catch((error) => logger.error(error));

process
  .on("unhandledRejection", (reason, p) => {
    logger.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    logger.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });
