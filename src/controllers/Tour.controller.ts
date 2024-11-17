import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";

import Tour from "../models/Tour.model";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./Factory.controller";
import AsyncHandler from "../utils/AsyncHandler";

export const getAllTours = getAll(Tour);
export const getTour = getOne(Tour, { path: "reviews" });
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

export const getTourStats = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRatings: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      {
        $project: {
          difficulty: "$_id",
          numTours: 1,
          numRatings: 1,
          avgRating: 1,
          avgPrice: 1,
          minPrice: 1,
          maxPrice: 1,
          _id: 0,
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        stats,
      },
    });
  },
);

export const getMonthlyPlan = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { year } = req.params;
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTours: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $sort: { numTours: -1 },
      },
      {
        $project: {
          month: "$_id",
          numTours: 1,
          tours: 1,
          _id: 0,
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        plan,
      },
    });
  },
);
