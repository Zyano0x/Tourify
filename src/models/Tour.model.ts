import { Document, Schema, Types, model } from "mongoose";
import slugify from "slugify";

enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Difficult",
}

interface Location {
  type: string;
  coordinates: [number, number];
  address: string;
  description: string;
  day?: number;
}

export interface ITour {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: string[];
  startDates?: Date[];
  secret: boolean;
  startLocation: Location;
  locations?: Location[];
  guides?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITourDocument extends ITour, Document {}

const tourSchema = new Schema<ITourDocument>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      maxlength: [40, "Name must have less or equal then 40 characters"],
      minlength: [10, "Name must have more or equal then 10 characters"],
      unique: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Max Group Size is required"],
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: {
        values: Object.values(Difficulty),
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 1.0,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val: number) {
          // This only points to current doc on NEW document creation
          return val <= this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Summary is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Image Cover is required"],
    },
    images: [String],
    startDates: [Date],
    secret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });

// Virtual Properties
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// Document Middleware
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.find({ secret: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.populate({
    path: "guides",
    select: "name email role",
  });
  next();
});

const Tour = model<ITourDocument>("Tour", tourSchema);

export default Tour;
