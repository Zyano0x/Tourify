import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";

import config from "../configs/app.config";
import logger from "../configs/logger.config";
import ErrorHandler from "../utils/ErrorHandler";

const sendErrorDevelopment = (err: any, req: Request, res: Response) => {
  logger.error(err);

  return res.status(err.status).json({
    status: `${err.status}`.startsWith("4") ? "fail" : "error",
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err: any, req: Request, res: Response) => {
  logger.error(err);

  return res.status(err.status).json({
    status: `${err.status}`.startsWith("4") ? "fail" : "error",
    message: err.message,
  });
};

export const apiErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  err.message = err.message || "Internal Server Error";

  if (config.ENV === "development") {
    sendErrorDevelopment(err, req, res);
  } else if (config.ENV === "production") {
    sendErrorProduction(err, req, res);
  }
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { method, path } = req;
  return next(
    new ErrorHandler(
      `${method} ${path} Endpoint Not Found!`,
      StatusCodes.NOT_FOUND,
    ),
  );
};
