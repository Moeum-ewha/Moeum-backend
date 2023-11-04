import { NextFunction, Request, Response } from "express";
import ServerError from "../services/error";

// 인자가 네개이고 맨 마지막 미들웨어이며 단 한개일 때 express가 에러핸들러 함수임을 알아챔.
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

  res.status(code).json({
    success: false,
    message: message,
  });
};
