import { NextFunction, Request, Response } from "express";
import ServerError from "../../services/error";
import isInt from "validator/lib/isInt";

export const validateViewPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = req.params.id;
    if (!isInt(postId)) {
      throw new ServerError("POST__INVALID_POSTID", 400);
    }

    next(); // validation success
  } catch (error) {
    next(error);
  }
};
