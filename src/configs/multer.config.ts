import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";

const multerStorage = multer.memoryStorage();
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ErrorHandler("Please upload only images", StatusCodes.BAD_REQUEST));
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
