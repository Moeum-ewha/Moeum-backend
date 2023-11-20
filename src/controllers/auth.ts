import { NextFunction, Request, Response } from "express";
import { User } from "../models/User.model";
import AuthService from "../services/auth";
import ServerError from "../services/error";

const authController = {
  loginEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email as string; // validation에서 string임을 확인함
      const password = req.body.password as string;

      const user = await User.findOne({
        where: { email },
        rejectOnEmpty: true,
      });

      const { derivedKey } = await AuthService.hashPassword(
        password,
        user.salt,
      );
      if (derivedKey !== user.password) {
        throw new ServerError("AUTH__PW_MISMATCH", 401);
      }

      const accessToken = await AuthService.generateToken(user.id, "access");
      const refreshToken = await AuthService.generateToken(user.id, "refresh");

      res.cookie(AuthService.COOKIE_ACCESS_NAME, `Bearer ${accessToken}`, {
        maxAge: AuthService.COOKIE_ACCESS_MAXAGE,
        httpOnly: true,
      });
      res.cookie(AuthService.COOKIE_REFRESH_NAME, `Bearer ${refreshToken}`, {
        maxAge: AuthService.COOKIE_REFRESH_MAXAGE,
        httpOnly: true,
      });

      res.set("moeumaccesstoken", accessToken);
      res.set("moeumrefreshtoken", refreshToken);

      res.status(200).json({
        success: true,
        user: user.toResponse(),
      });
    } catch (error) {
      next(error);
    }
  },
  logoutEmail: (req: Request, res: Response, next: NextFunction) => {},
};

export default authController;
