import { Request, Response, NextFunction } from "express";
import { sequelize } from "../services/database";
import ServerError from "../services/error";
import { Friend } from "../models/Friend.model";
import { User } from "../models/User.model";
import { Post } from "../models/Post.model";
import { FriendPost } from "../models/FriendPost.model";

const friendController = {
  viewFriend: async (req: Request, res: Response, next: NextFunction) => {},
  deleteFriend: () => {},
};

export default friendController;
