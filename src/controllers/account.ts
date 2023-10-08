import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";

type SignUpRequest = {
  email: string;
  username: string;
  password: string;
};

type AccountResponse = {
  id: number;
  email: string; // NOT NULL -> Required field (물음표 없음)
  username: string;
  createdAt: Date;
};

const accountController = {
  viewMyAccount: (req: Request, res: Response, next: NextFunction) => {},
  createAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 회원가입
      const { email, username, password } = req.body;

      const [hashed, salt] = ["temphashed", "tempsalt"];

      // DB에 새 유저 생성
      const user = await User.create({
        email: email,
        username: username,
        password: password,
        salt: salt,
      });

      const token = "temptoken";

      const response = {
        success: true,
        token: "",
        user: user,
      };

      res.status(201);
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  },
  updateAccount: (req: Request, res: Response, next: NextFunction) => {},
  deleteAccount: (req: Request, res: Response, next: NextFunction) => {},
};

export default accountController;
