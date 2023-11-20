import { PostResponse } from "./../models/Post.model";
import { NextFunction, Request, Response } from "express";
import ServerError from "../services/error";
import { Post } from "../models/Post.model";
import { User } from "../models/User.model";
import { sequelize } from "../services/database";
import { Friend, FriendCAttribs } from "../models/Friend.model";

const postsController = {
  viewPosts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) throw new ServerError("UNAUTHENTICATED", 401);

      const user = await User.findByPk(userId);
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const posts = await Post.findAll({
        where: { createdById: user.id },
        include: [{ model: User, foreignKey: "createdById" }],
      });

      res.status(200).json({
        success: true,
        posts: posts.map((post) => post.toResponseSimple()), // return 생략된 거 꼭 조심!
      });
    } catch (error) {
      next(error);
    }
  },
  createPost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) throw new ServerError("UNAUTHENTICATED", 401);

      const user = await User.findByPk(userId);
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const takenAt = req.body.takenAt;
      const location = req.body.location;
      const latitude = req.body.latitude;
      const longitude = req.body.longitude;

      const newFriendNames = req.body.newFriendNames.split(","); // ["윤선", "건희"]
      const oldFriendNames = req.body.oldFriendNames.split(","); // [""]
      const friendNames = newFriendNames.concat(oldFriendNames); // ["건희", ""]

      const files = req.files as {
        // req.files as Record<string, Express.MulterS3.File[]> 와 같은 표현
        [fieldname: string]: Express.MulterS3.File[];
      };
      const originalImgPath = files.original[0].key.replace(/^images\//, "");
      const faceImgPaths = files.faces.map((face) =>
        face.key.replace(/^images\//, ""),
      );

      if (newFriendNames.length !== faceImgPaths.length)
        throw new ServerError(
          "POSTS__NEWFRIENDNAMES_FACEIMGPATHS_LENGTH_NOT_EQUAL",
          400,
        );

      const postResponse = await sequelize.transaction(async (transaction) => {
        const post = await Post.create(
          {
            content: req.body.content,
            takenAt: takenAt,
            location: location,
            latitude: latitude,
            longitude: longitude,
            imgPath: originalImgPath,
            createdById: user.id, // 외래키 직접 지정
          },
          { transaction },
        );

        const friends: Friend[] = [];
        for (let i = 0; i < friendNames.length; i++) {
          const friendName = friendNames[i];

          if (!friendName) continue;

          // findOrCreate가 리턴할 때 첫번째 인자로 생성하거나 찾은 친구를, 두번째 인자로 지금 새로 만든건지 여부를 돌려줌
          const result = await Friend.findOrCreate({
            // 찾을 때 사용할 데이터
            where: {
              friendName: friendName,
              createdById: user.id,
            },
            // 만들 때 사용할 데이터
            defaults: {
              friendName: friendName,
              imgPath: faceImgPaths[i],
              createdById: user.id,
            },
            transaction,
          });

          const friend = result[0];
          friends.push(friend);
        }

        // throughTable에 row가 하나 추가됨
        // friends와 posts에 각각 서로 추가됨
        for (const friend of friends) {
          await friend.$add("posts", post, { transaction });
        }

        // const friends = await Friend.bulkCreate(friendsData, { transaction });

        // SELECT * FROM users WHERE users.id = 1(post.createdById);

        await post.reload({ include: [User, Friend], transaction });

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
