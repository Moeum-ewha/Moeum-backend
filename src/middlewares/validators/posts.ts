import { NextFunction, Request, Response } from "express";
import isISO8601 from "validator/lib/isISO8601";
import isFloat from "validator/lib/isFloat";
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

    const location = req.body.location;
    if (typeof location !== "string")
      throw new ServerError("POSTS__INVALID_LOCATION_TYPE", 400);
    if (location.length === 0)
      throw new ServerError("POSTS__INVALID_LOCATION_LENGTH", 400);

    const latitude = req.body.latitude;
    if (!isFloat(latitude))
      throw new ServerError("POSTS__INVALID_LATITUDE_TYPE", 400);
    const float_latitude = parseFloat(latitude);
    if (float_latitude > 90 || float_latitude < -90)
      throw new ServerError("POSTS__INVALID_LATITUDE", 400);

    const longitude = req.body.longitude;
    if (!isFloat(longitude))
      throw new ServerError("POSTS__INVALID_LONGITUDE_TYPE", 400);
    const float_longitude = parseFloat(longitude);
    if (float_longitude > 180 || float_longitude < -180)
      throw new ServerError("POSTS__INVALID_LONGITUDE", 400);

    next(); // validation success
  } catch (error) {
    next(error);
  }
};
