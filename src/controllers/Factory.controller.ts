import { StatusCodes } from "http-status-codes";
import { Model, PopulateOptions } from "mongoose";
import { Request, Response, NextFunction } from "express";

import AsyncHandler from "../utils/AsyncHandler";
import ErrorHandler from "../utils/ErrorHandler";
import { QueryString, APIFeatures } from "../utils/API";

export const deleteOne = (Model: Model<any>) =>
  AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new ErrorHandler(
          "No document found with that ID",
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  });

export const updateOne = (Model: Model<any>) =>
  AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new ErrorHandler(
          "No document found with that ID",
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

export const createOne = (Model: Model<any>) =>
  AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    if (!doc) {
      return next(
        new ErrorHandler(
          "Internal Server Error! Server failed creating new document",
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

export const getOne = (Model: Model<any>, popOptions?: PopulateOptions) =>
  AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new ErrorHandler(
          "No document found with that ID",
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

export const getAll = (Model: Model<any>) =>
  AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.id) filter = { tour: req.params.id };

    const features = new APIFeatures(
      Model.find(filter),
      req.query as QueryString,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(StatusCodes.OK).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });
