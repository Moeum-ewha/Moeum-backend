import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";
import AuthService from "../services/auth";
import ServerError from "../services/error";

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
      const user = await User.create({
        email: email,
        username: username,
        password: derivedKey,
        salt: salt,
      });

      const accessToken = await AuthService.generateToken(user.id, "access");
      const refreshToken = await AuthService.generateToken(user.id, "refresh");

      const response = {
        success: true,
        token: "",
        user: user.toResponse(),
      };

      res.cookie(AuthService.COOKIE_ACCESS_NAME, `Bearer ${accessToken}`, {
        maxAge: AuthService.COOKIE_ACCESS_MAXAGE,
        httpOnly: true,
      });
      res.cookie(AuthService.COOKIE_REFRESH_NAME, `Bearer ${refreshToken}`, {
        maxAge: AuthService.COOKIE_REFRESH_MAXAGE,
        httpOnly: true,
      });

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },
  updateAccount: (req: Request, res: Response, next: NextFunction) => {},
  deleteAccount: (req: Request, res: Response, next: NextFunction) => {},
};

export default accountController;
