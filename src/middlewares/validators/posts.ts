import { NextFunction, Request, Response } from "express";
import isDate from "validator/lib/isDate";
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
    if (!takenAt || !isDate(takenAt))
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

    // 이거 꼭 다시 바꿔줘야함!!!!!!!!
    // if (!(friendNames instanceof Array))
    //   throw new ServerError("POSTS__INVALID_FRIENDNAMES_TYPE", 400);

    // if (friendNames.length === 0 || friendNames.length > 3)
    //   throw new ServerError("POSTS__INVALID_FRIENDNAMES_LENGTH", 400);
    // for (const friendName of friendNames) {
    //   if (typeof friendName !== "string")
    //     throw new ServerError("POSTS__INVALID_FRIENDNAME_TYPE", 400);
    //   if (friendName.length === 0 || friendName.length > 32)
    //     throw new ServerError("POSTS__INVALID_FRIENDNAME_LENGTH", 400);
    // }

    // const file = req.file as Express.MulterS3.File;
    const files = req.files as {
      [fieldname: string]: Express.MulterS3.File[];
    };
    // const formdata = {
    //   original: [file1],
    //   faces: [file2, file3],
    //   newFriendNames: "yunsun,youngwoo",
    //   oldFriendNames: "건희"
    // }

    // req.body.newFriendNames 이렇게 쓰면 됨!

    if (!files) throw new ServerError("POSTS__FILES_NOT_INCLUDED", 400);
    if (files.original?.length === 0)
      throw new ServerError("POSTS__FILES_ORIGINAL_NOT_INCLUDED", 400);
    if (!files.faces)
      throw new ServerError("POSTS__FILES_FACES_NOT_INCLUDED", 400);
    const newFriendNames = req.body.newFriendNames;
    if (newFriendNames !== "" && !newFriendNames)
      throw new ServerError("POSTS__FILES_NEWFRIENDNAMES_NOT_INCLUDED", 400);
    const oldFriendNames = req.body.oldFriendNames;
    if (oldFriendNames !== "" && !oldFriendNames)
      throw new ServerError("POSTS__FILES_OLDFRIENDNAMES_NOT_INCLUDED", 400);

    next(); // validation success
  } catch (error) {
    next(error);
  }
};
