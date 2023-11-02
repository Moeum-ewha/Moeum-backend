import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth";

// 로그인이 안되어도 실패하지 않음. 로그인이 되어 있는지 확인만 함.
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user = await AuthService.authenticate(req);
  if (!user) {
    const newAccessToken = await AuthService.renewAccessToken(req);
    res.cookie(AuthService.COOKIE_ACCESS_NAME, `Bearer ${newAccessToken}`, {
      maxAge: AuthService.COOKIE_ACCESS_MAXAGE,
      httpOnly: true,
    });
    user = await AuthService.authenticate(req, newAccessToken);
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
  let user = await AuthService.authenticate(req);
  if (!user) {
    const newAccessToken = await AuthService.renewAccessToken(req);
    res.cookie(AuthService.COOKIE_ACCESS_NAME, `Bearer ${newAccessToken}`, {
      maxAge: AuthService.COOKIE_ACCESS_MAXAGE,
      httpOnly: true,
    });
    user = await AuthService.authenticate(req, newAccessToken);
  }

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ success: false, error: "UNAUTHENTICATED" });
  }
};
