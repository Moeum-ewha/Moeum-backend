import { NextFunction, Request, Response } from "express";
import ServerError from "../services/error";
import { User } from "../models/User.model";
import { Post } from "../models/Post.model";
import { Friend } from "../models/Friend.model";

const latestController = {
  viewLatest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const post = await Post.findAll({
        order: [["takenAt", "DESC"]],
        limit: 1,
        include: [Friend],
      });

      if (post.length === 0) {
        throw new ServerError("post 배열 비어따!", 400);
      }

      res.status(200).json({
        success: true,
        post: post[0].toResponse(),
      });
    } catch (error) {
      next(error);
    }
  },
};

export default latestController;
