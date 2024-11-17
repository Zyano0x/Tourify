import { Request, Response, NextFunction } from "express";

export const profile = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.params.id = req.user.id;
  next();
};
