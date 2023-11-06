import { NextFunction, Request, Response } from "express";
import isISO8601 from "validator/lib/isISO8601";
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
      throw new ServerError("POSTS__INVALID_CONTENT_TYPE", 400);
    if (content.length === 0 || content.length > 255)
      throw new ServerError("AUTH__INVALID_CONTENT_LENGTH", 400);

    const takenAt = req.body.takenAt;
    if (!takenAt || !isISO8601(takenAt))
      throw new ServerError("POSTS__INVALID_DATE_TYPE", 400);

    next(); // validation success
  } catch (error) {
    next(error);
  }
};
