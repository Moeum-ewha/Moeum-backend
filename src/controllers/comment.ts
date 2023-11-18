import { NextFunction, Request, Response } from "express";
import isInt from "validator/lib/isInt";
import ServerError from "../services/error";
import { sequelize } from "../services/database";
import { Comment } from "../models/Comment.model";

const commentController = {
  createComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id;
      if (!isInt(postId)) {
        throw new ServerError("POST__INVALID_POSTID", 400);
      }

      const commentResponse = await sequelize.transaction(async (t) => {
        const comment = await Comment.create(
          {
            profile: req.body.profile, // 0-24
            content: req.body.content,
            postId: parseInt(postId),
          },
          { transaction: t },
        );

        return comment.toResponse();
      });

      res.status(201).json({
        success: true,
        comment: commentResponse,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default commentController;
