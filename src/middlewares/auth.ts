import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth";
import ServerError from "../services/error";

// 로그인이 안되어도 실패하지 않음. 로그인이 되어 있는지 확인만 함.
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // accessToken 확인
  let user = await AuthService.authenticate(req);
  // accessToken 확인에 실패하면 refreshToken 확인을 시도함
  if (!user) {
    const newAccessToken = await AuthService.renewAccessToken(req);
    if (newAccessToken) {
      res.cookie(AuthService.COOKIE_ACCESS_NAME, `Bearer ${newAccessToken}`, {
        maxAge: AuthService.COOKIE_ACCESS_MAXAGE,
        httpOnly: true,
      });
      user = await AuthService.authenticate(req, newAccessToken);
    }
  }
  if (user) req.user = user;
  next();
};

// 로그인이 안되면 안됨. 바로 401 보냄.
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user = await AuthService.authenticate(req);
    if (!user) {
      const newAccessToken = await AuthService.renewAccessToken(req);
      if (!newAccessToken)
        throw new ServerError("REQUIREAUTH__NO_NEWACCESSTOKEN", 400);
      res.cookie(AuthService.COOKIE_ACCESS_NAME, `Bearer ${newAccessToken}`, {
        maxAge: AuthService.COOKIE_ACCESS_MAXAGE,
        httpOnly: true,
      });
      res.set("Moeum-Access-Token", newAccessToken);
      user = await AuthService.authenticate(req, newAccessToken);
    }

    if (user) {
      req.user = user;
      next();
    } else {
      console.log("requireAuth");
      res.status(401).json({ success: false, error: "UNAUTHENTICATED" });
    }
  } catch (error) {
    next(error);
  }
};
