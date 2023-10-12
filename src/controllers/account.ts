import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";
import AuthService from "../services/auth";
import ServerError from "../services/error";

const accountController = {
  viewMyAccount: (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);
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

      const token = AuthService.generateToken(user.id);

      const response = {
        success: true,
        token: "",
        user: user.toResponse(),
      };

      res.status(201);
      res.cookie(AuthService.COOKIE_NAME, `Bearer ${token}`, {
        maxAge: AuthService.COOKIE_MAXAGE,
        httpOnly: true,
      })
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
  updateAccount: (req: Request, res: Response, next: NextFunction) => {},
  deleteAccount: (req: Request, res: Response, next: NextFunction) => {},
};

export default accountController;
