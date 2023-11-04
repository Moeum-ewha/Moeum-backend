import { NextFunction, Request, Response } from "express";
import isEmail from "validator/lib/isEmail";
import ServerError from "../../services/error";

export const validateLoginEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) throw new ServerError("AUTH__MISSING_BODY", 400);

    const email = req.body.email;
    if (typeof email !== "string")
      throw new ServerError("AUTH__INVALID_EMAIL_TYPE", 400);
    if (!isEmail(email)) throw new ServerError("AUTH__INVALID_EMAIL", 400);

    const password = req.body.password;
    if (typeof password !== "string")
      throw new ServerError("AUTH__INVALID_PW_TYPE", 400);
    if (password.length === 0 || password.length > 128)
      throw new ServerError("AUTH__INVALID_PW", 400);

    next(); // validation success
  } catch (error) {
    next(error);
  }
};
