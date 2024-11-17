import mongoose, { Document, Schema, Types, Model } from "mongoose";

import Tour from "./Tour.model";

export interface IReview {
  review: string;
  rating: number;
  tour: Types.ObjectId;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReviewDocument extends IReview, Document {}

export interface IReviewModel extends Model<IReviewDocument> {
  calculateAverageRatings(tour: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    review: {
      type: String,
      required: [true, "Review is required"],
    },
    rating: {
      type: Number,
      required: true,
      min: [1.0, "Rating must be at least 1.0"],
      max: [5.0, "Rating must be at most 5.0"],
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Tour is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
  },
  { timestamps: true },
);

// Index (Prevent duplicate review in tour)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query Middleware
reviewSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// Document Middleware
reviewSchema.post("save", async function (this: IReviewDocument) {
  const reviewModel = this.constructor as IReviewModel;
  await reviewModel.calculateAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function (doc: IReviewDocument) {
  console.log(doc);
  const reviewModel = doc.constructor as IReviewModel;
  await reviewModel.calculateAverageRatings(doc.tour);
});

reviewSchema.statics.calculateAverageRatings = async function (
  tour: Types.ObjectId,
) {
  const stats = await this.aggregate([
    {
      $match: { tour },
    },
    {
      $group: {
        _id: "$tour",
        numRatings: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findOneAndUpdate(
      { _id: tour },
      {
        ratingsQuantity: stats[0].numRatings,
        ratingsAverage: stats[0].avgRatings,
      },
    );
  } else {
    await Tour.findOneAndUpdate(
      { _id: tour },
      {
        ratingsQuantity: 0,
        ratingsAverage: 1,
      },
    );
  }
};

const Review = mongoose.model<IReviewDocument, IReviewModel>(
  "Review",
  reviewSchema,
);

export default Review;
