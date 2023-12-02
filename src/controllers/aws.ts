import { NextFunction, Request, Response } from "express";

const awsController = {
  healthCheck: async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send();
  },
};

export default awsController;
