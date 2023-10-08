import { NextFunction, Request, Response } from "express";
import ServerError from "../services/error";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let code: number;
  let message: string;

  if (err instanceof ServerError) {
    code = err.code;
    message = err.message;
    console.error(err);
  } else {
    code = 500;
    if (err instanceof Error) {
      message = err.message;
    } else {
      message = "UNEXPECTED_ERROR";
    }
    console.error(err);
  }
};
