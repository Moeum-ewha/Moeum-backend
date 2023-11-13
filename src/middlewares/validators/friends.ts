import { NextFunction, Request, Response } from "express";
import ServerError from "../../services/error";

export const validateCreateFriend = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) throw new ServerError("AUTH__MISSING_BODY", 400);

    const friendName = req.body.friendName;
    if (typeof friendName !== "string")
      throw new ServerError("FRIENDS__INVALID_FRIENDNAME_TYPE");
    if (friendName.length === 0 || friendName.length > 12)
      throw new ServerError("FRIENDS__INVALID_FRIENDNAME_LENGTH");

    next(); // validation success
  } catch (error) {
    next(error);
  }
};
