import { checkAuth, requireAuth } from "./middlewares/auth";
import {
  validateCreateAccount,
  validateLoginEmail,
} from "./middlewares/validator";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import accountController from "./controllers/account";
import { errorHandler } from "./controllers/error";
import authController from "./controllers/auth";
import postController from "./controllers/post";
import postsController from "./controllers/posts";

// Config
dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Controllers
app
  .route("/account")
  .get(requireAuth, accountController.viewMyAccount)
  .post(validateCreateAccount, accountController.createAccount)
  .put(requireAuth, accountController.updateAccount)
  .delete(requireAuth, accountController.deleteAccount);
app
  .route("/auth")
  .post(validateLoginEmail, authController.loginEmail) // login
  .delete(authController.logoutEmail); // logout
app
  .route("/posts")
  .get(requireAuth, postsController.viewPosts)
  .post(requireAuth, postsController.createPost);
app
  .route("/post/:id")
  .get(requireAuth, postController.viewPost)
  .put(requireAuth, postController.editPost)
  .delete(requireAuth, postController.deletePost);

// Error Handler (ALWAYS last)
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server listening in port ${PORT}`);
});
