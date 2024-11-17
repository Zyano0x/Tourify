import Review from "../models/Review.model";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./Factory.controller";

export const getAllReviews = getAll(Review);
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
