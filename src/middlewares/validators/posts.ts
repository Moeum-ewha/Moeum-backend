import { NextFunction, Request, Response } from "express";
import ServerError from "../../services/error";

export const validateCreatePost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) throw new ServerError("AUTH__MISSING_BODY", 400);

    const content = req.body.content;
    if (typeof content !== "string")
      throw new ServerError("POSTS_INVALID_CONTENT", 400);
    if (content.length === 0 || content.length > 255)
      throw new ServerError("AUTH__INVALID_PW", 400);

    next(); // validation success
  } catch (error) {
    next(error);
  }
};
