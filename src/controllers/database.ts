import { NextFunction, Request, Response } from "express";
import { sequelize } from "../services/database";

const databaseController = {
  syncDatabase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sequelize.sync({ force: true });

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default databaseController;
