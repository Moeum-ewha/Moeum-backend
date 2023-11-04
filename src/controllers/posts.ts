import { NextFunction, Request, Response } from "express";
import ServerError from "../services/error";
import { Post } from "../models/Post.model";
import { User } from "../models/User.model";
import { sequelize } from "../services/database";

const postsController = {
  viewPosts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      // await user.$get("posts", { include: [User] }); // user.posts에 값 넣어줌

      const posts = await Post.findAll({
        where: { createdById: user.id },
        include: [{ model: User, foreignKey: "createdById" }],
        // include: [User],
        // include: User 와 같은 뜻!
        // post만 불러오지 않고 user 정보 전체 불러오는 역할!
        // 만약 게시물이 없으면 findAll은 '빈 배열'을 반환함
      });

      res.status(200).json({
        success: true,
        posts: posts.map((post) => post.toResponse()), // return 생략된 거 꼭 조심!
      });
    } catch (error) {
      next(error);
    }
  },
  createPost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const postResponse = await sequelize.transaction(async (t) => {
        const post = await Post.create(
          {
            content: req.body.content,
            createdById: user.id, // 외래키 직접 지정
          },
          { transaction: t },
        );

        // SELECT * FROM users WHERE users.id = 1(post.createdById);

        await post.reload({ include: [User], transaction: t });

        return post.toResponse();
      });

      res.status(201).json({
        success: true,
        post: postResponse,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default postsController;
