import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const config = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3005,
  HOST: process.env.HOST || "localhost",
  ENV: process.env.ENV || "development",
  DB_URL: process.env.DATABASE_URL || "",
  DB_PASSWORD: process.env.DATABASE_PASSWORD || "",
  JWT_SECRET: process.env.JWT_SECRET_KEY || "",
  JWT_EXPIRES: process.env.JWT_EXPIRES_IN,
  JWT_COOKIE_EXPIRES: process.env.JWT_COOKIE_EXPIRES_IN
    ? Number(process.env.JWT_COOKIE_EXPIRES)
    : 30,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 2525,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
};

export default config;
