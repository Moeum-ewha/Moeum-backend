import { PostResponse } from "./../models/Post.model";
import { NextFunction, Request, Response } from "express";
import isInt from "validator/lib/isInt";
import ServerError from "../services/error";
import { Post } from "../models/Post.model";
import { User } from "../models/User.model";
import { sequelize } from "../services/database";

const postController = {
  viewPost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id;
      if (!isInt(postId)) {
        throw new ServerError("POST__INVALID_POSTID", 400);
      }

      const post = await Post.findOne({
        where: { id: postId },
        include: [{ model: User, foreignKey: "createdById" }],
      });

      if (!post) {
        throw new ServerError("POST__NOT_FOUND", 404);
      }

      res.status(200).json({
        success: true,
        post: post.toResponse(),
      });
    } catch (error) {
      next(error);
    }
  },
  editPost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const content = req.body.content;
      const takenAt = new Date(req.body.takenAt);
      const location = req.body.location;
      const latitude = req.body.latitude;
      const longitude = req.body.longitude;

      const postId = req.params.id;
      if (!isInt(postId)) {
        throw new ServerError("POST__INVALID_POSTID", 400);
      }

      const postResponse = await sequelize.transaction(async (t) => {
        const post = await Post.findByPk(postId, {
          include: [User],
          transaction: t,
        });

        if (!post) {
          throw new ServerError("POST__NOT_FOUND", 404);
        }

        post.set("content", content);
        post.set("takenAt", takenAt);
        post.set("location", location);
        post.set("latitude", latitude);
        post.set("longitude", longitude);

        await post.save({ transaction: t }); // 변경사항이 있을 때만 보냄

        return post.toResponse();
      });

      res.status(200).json({
        success: true,
        post: postResponse,
      });

      // 이렇게 쓰지 않는 이유는 첫 줄에서 수정된 post를 반환하지 않고 수정된 데이터의 수를 반환해서.. 또 find 해야 함.
      // const post = await Post.update(
      //   {
      //     content: req.body.content,
      //     createdById: user.id,
      //   },
      //   { where: { id: postId }, transaction: t },
      // );

      // await post.reload({ include: [User], transaction: t });
    } catch (error) {
      next(error);
    }
  },
  deletePost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const postId = req.params.id;
      const post = await Post.findOne({
        where: { id: postId, createdById: user.id },
      });

      if (!post) throw new ServerError("POST__NOT_FOUND", 404);

      // 위에 where 절에 createdById 추가해서 찾는 방식이 Model에 따로 Column 추가 안해도 됨!
      // if (post.createdById !== user.id) {
      //   throw new ServerError("POST__UNAUTHORIZED_TO_DELETE", 403);
      // }

      await post.destroy();

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default postController;
