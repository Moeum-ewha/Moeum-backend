import { UserResponse } from "./../models/User.model";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";
import AuthService from "../services/auth";
import ServerError from "../services/error";
import { sequelize } from "../services/database";

const accountController = {
  viewMyAccount: (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);
      res.status(200).json({
        success: true,
        user: user.toResponse(),
      });
    } catch (error) {
      next(error);
    }
  },
  createAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 회원가입
      const { email, username, password } = req.body;

      const { derivedKey, salt } = await AuthService.hashPassword(password);

      // DB에 새 유저 생성
      const userResponse = await sequelize.transaction(async (t) => {
        const user = await User.create(
          {
            email: email,
            username: username,
            password: derivedKey,
            salt: salt,
          },
          { transaction: t },
        );
        return user.toResponse();
      });

      const accessToken = await AuthService.generateToken(
        userResponse.id,
        "access",
      );
      const refreshToken = await AuthService.generateToken(
        userResponse.id,
        "refresh",
      );

      res.cookie(AuthService.COOKIE_ACCESS_NAME, `Bearer ${accessToken}`, {
        maxAge: AuthService.COOKIE_ACCESS_MAXAGE,
        httpOnly: true,
      });
      res.cookie(AuthService.COOKIE_REFRESH_NAME, `Bearer ${refreshToken}`, {
        maxAge: AuthService.COOKIE_REFRESH_MAXAGE,
        httpOnly: true,
      });

      res.status(201).json({
        success: true,
        user: userResponse,
      });
    } catch (error) {
      next(error);
    }
  },
  updateAccount: (req: Request, res: Response, next: NextFunction) => {},
  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);

      const userId = user.id;

      // db에서 유저찾기
      const dbUser = await User.findByPk(userId);

      if (!dbUser) {
        throw new ServerError("ACCOUNT__USER_NOT_FOUND", 404);
      }

      await sequelize.transaction(async (t) => {
        await dbUser.destroy({ transaction: t });
      });

      res.clearCookie(AuthService.COOKIE_ACCESS_NAME);
      res.clearCookie(AuthService.COOKIE_REFRESH_NAME);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default accountController;
