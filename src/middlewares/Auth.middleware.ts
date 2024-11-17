import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import config from "../configs/app.config";
import User from "../models/User.model";
import AsyncHandler from "../utils/AsyncHandler";
import ErrorHandler from "../utils/ErrorHandler";

export const protect = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ErrorHandler(
          "Please login to get access",
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return next(
        new ErrorHandler("User no longer exists", StatusCodes.UNAUTHORIZED),
      );
    }

    if (user.isJWTExpired(decoded.iat as number)) {
      return next(
        new ErrorHandler("Please log in again", StatusCodes.UNAUTHORIZED),
      );
    }

    // @ts-ignore
    req.user = user;
    next();
  },
);

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          "You do not have permission to access",
          StatusCodes.FORBIDDEN,
        ),
      );
    }
    next();
  };
};
