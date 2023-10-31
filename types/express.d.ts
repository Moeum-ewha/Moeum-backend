import type { User } from "../models/User.model";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
