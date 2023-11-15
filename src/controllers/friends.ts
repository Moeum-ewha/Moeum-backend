import { NextFunction, Request, Response } from "express";
import ServerError from "../services/error";
import { sequelize } from "../services/database";
import { Friend } from "../models/Friend.model";
import { User } from "../models/User.model";

const friendsController = {
  viewFriends: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const friends = await Friend.findAll({
        where: { createdById: user.id },
        include: [{ model: User, foreignKey: "createdById" }],
      });

      res.status(200).json({
        success: true,
        friends: friends.map((friend) => friend.toResponse()),
      });
    } catch (error) {
      next(error);
    }
  },
  // createFriend: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const user = req.user;
  //     if (!user) throw new ServerError("UNAUTHENTICATED", 401);

  //     const friendResponse = await sequelize.transaction(async (t) => {
  //       const friend = await Friend.create(
  //         {
  //           friendName: req.body.friendName,
  //           createdById: user.id,
  //         },
  //         { transaction: t },
  //       );

  //       await friend.reload({ include: [User], transaction: t });

  //       return friend.toResponse();
  //     });

  //     res.status(201).json({
  //       success: true,
  //       friend: friendResponse,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },
};

export default friendsController;
