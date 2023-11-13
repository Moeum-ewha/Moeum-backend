import { NextFunction, Request, Response } from "express";
import { sequelize } from "../services/database";

const databaseController = {
  syncDatabase: async (req: Request, res: Response, next: NextFunction) => {
    await sequelize.sync({ force: true });
  },
};

export default databaseController;
