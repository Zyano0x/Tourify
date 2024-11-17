import mongoose from "mongoose";
import config from "./app.config";
import logger from "./logger.config";

const DB: string = config.DB_URL.replace("<db_password>", config.DB_PASSWORD);

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(DB);

    if (config.ENV === "development") {
      logger.info(
        `MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`,
      );
    }
  } catch (error) {
    logger.error(error);
  }
};

export default dbConnect;
