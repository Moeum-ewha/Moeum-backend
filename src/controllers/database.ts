import { NextFunction, Request, Response } from "express";
import { sequelize } from "../services/database";

const databaseController = {
  syncDatabase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("db before");
      await sequelize.sync({ force: true });

      console.log("db after");
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default databaseController;
