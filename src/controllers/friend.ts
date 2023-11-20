import { NextFunction, Request, Response } from "express";
import { User } from "../models/User.model";
import ServerError from "../services/error";
import { Friend } from "../models/Friend.model";
import { Post } from "../models/Post.model";

const friendController = {
  viewFriend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) throw new ServerError("UNAUTHENTICATED", 401);

      const user = await User.findByPk(userId);
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const friendId = req.params.id;

      const friend = await Friend.findOne({
        where: { id: friendId },
        include: [{ model: Post, foreignKey: "postId" }],
      });

      if (!friend) {
        throw new ServerError("FRIEND__NOT_FOUND", 404);
      }

      res.status(200).json({
        success: true,
        friend: friend.toResponse(),
      });
    } catch (error) {
      next(error);
    }
  },
  deleteFriend: () => {},
};

export default friendController;
