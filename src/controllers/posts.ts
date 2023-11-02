import { NextFunction, Request, Response } from "express";
import ServerError from "../services/error";

const postsController = {
  viewPosts: async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {
      next(error);
    }
  },
  createPost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ServerError("UNAUTHENTICATED", 401);
    } catch (error) {
      next(error);
    }
  },
};

export default postsController;
