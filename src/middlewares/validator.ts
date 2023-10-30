import { NextFunction, Request, Response } from "express";
import isEmail from "validator/lib/isEmail";
import ServerError from "../services/error";
import { User } from "../models/User.model";
import { errorHandler } from "../controllers/error";

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

export const validateCreateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) throw new ServerError("ACCOUNT__MISSING_BODY", 400);

    const email = req.body.email;
    const password = req.body.password;

    if (!email || typeof email !== "string" || !isEmail(email)) {
      throw new ServerError("ACCOUNT__INVALID_EMAIL", 400);
    }

    if (!password || typeof password !== "string") {
      throw new ServerError("ACCOUNT__MISSING_PW", 400);
    }

    if (password.length < 5) {
      throw new ServerError("ACCOUNT__PW_TOO_SHORT", 400);
    }

    if (password.length > 32) {
      throw new ServerError("ACCOUNT__PW_TOO_LONG", 400);
    }

    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      throw new ServerError("ACCOUNT__EMAIL_ALREADY_EXISTS", 400);
    }

    next(); // vadlidation success
  } catch (error) {
    next(error);
  }
};
