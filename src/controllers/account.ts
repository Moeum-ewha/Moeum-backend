import { NextFunction, Request, Response } from "express";

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
  createAccount: (req: Request, res: Response, next: NextFunction) => {
    try {
      // 회원가입
      // 나중에 as SignUpRequest 처리하고 Validation 해줘야됨!
      const { email, username, password } = req.body;

      // TODO: DB에 새 유저 생성

      const user = {
        id: 123,
        email: email,
        username: username,
        createdAt: new Date(),
        // salt: salt,
      };

      const token = "temporarytoken";

      const response = {
        success: true,
        token: "",
        user: user,
      };

      res.status(201);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  },
  updateAccount: (req: Request, res: Response, next: NextFunction) => {},
  deleteAccount: (req: Request, res: Response, next: NextFunction) => {},
};

export default accountController;
