import { Request, Response, NextFunction } from "express";

export const setTourUserIds = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) {
    // @ts-ignore
    req.body.user = req.user.id;
  }
  next();
};
