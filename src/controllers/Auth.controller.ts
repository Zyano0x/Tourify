import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import config from "../configs/app.config";
import User, { IUserDocument } from "../models/User.model";
import AsyncHandler from "../utils/AsyncHandler";
import SendEmail from "../utils/Email";
import ErrorHandler from "../utils/ErrorHandler";

const signToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES,
  });
};

const generateToken = (
  user: IUserDocument,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user.id, user.role);
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: false,
  };

  res.cookie("Authorization", token, cookieOptions);

  // Remove password from output
  user.password = "";

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signUp = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm } = req.body;
    const user = await User.create({ name, email, password, passwordConfirm });

    if (!user) {
      return next(
        new ErrorHandler(
          "Internal Server Error! Server failed creating new user",
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }

    generateToken(user, StatusCodes.CREATED, res);
  },
);

export const signIn = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!email || !password) {
      return next(
        new ErrorHandler("Email or password is empty", StatusCodes.BAD_REQUEST),
      );
    }

    if (!user || !(await user.checkPassword(password))) {
      return next(
        new ErrorHandler(
          "Incorrect email or password",
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    generateToken(user, StatusCodes.OK, res);
  },
);

export const forgotPassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(
        new ErrorHandler(
          "No account exist with that email",
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;

    try {
      await SendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`,
      });

      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new ErrorHandler(
          "There was an error sending the email. Try again later!",
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  },
);

export const resetPassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordConfirm } = req.body;
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Token is invalid or has expired",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    generateToken(user, StatusCodes.OK, res);
  },
);

export const updatePassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id } = req.user;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    const user = await User.findOne({ _id: id }).select("+password");

    if (user) {
      if (!(await user.checkPassword(currentPassword))) {
        return next(
          new ErrorHandler(
            "Your current password is wrong",
            StatusCodes.UNAUTHORIZED,
          ),
        );
      }

      user.password = newPassword;
      user.passwordConfirm = newPasswordConfirm;
      await user.save();

      generateToken(user, StatusCodes.OK, res);
    }
  },
);
