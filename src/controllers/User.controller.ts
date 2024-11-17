import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";

import User from "../models/User.model";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./Factory.controller";
import AsyncHandler from "../utils/AsyncHandler";

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const createUser = createOne(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

export const deactivate = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    await User.findOneAndUpdate({ _id: req.user.id }, { active: false });

    res.status(StatusCodes.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  },
);
