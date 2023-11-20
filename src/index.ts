import { validateCreateFriend } from "./middlewares/validators/friends";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./services/database";
import { errorHandler } from "./controllers/error";
import { validateCreatePost } from "./middlewares/validators/posts";
import { validateCreateAccount } from "./middlewares/validators/account";
import { validateLoginEmail } from "./middlewares/validators/auth";
import { checkAuth, requireAuth } from "./middlewares/auth";
import AuthService from "./services/auth";
import accountController from "./controllers/account";
import authController from "./controllers/auth";
import postController from "./controllers/post";
import postsController from "./controllers/posts";
import commentController from "./controllers/comment";
import friendsController from "./controllers/friends";
import friendController from "./controllers/friend";
import { s3upload } from "./middlewares/file";
import imageController from "./controllers/image";
import databaseController from "./controllers/database";
import { validateViewPost } from "./middlewares/validators/post";
import cors from "cors";

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://10.200.10.143:5173",
    "http://10.200.32.167:5173",
  ],
  optionsSuccessStatus: 200,
  credentials: true,
  exposedHeaders: ["set-cookie", "moeumaccesstoken", "moeumrefreshtoken"],
};

// Config
dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors(corsOptions));

// Controllers
app
  .route("/account")
  .get(accountController.viewMyAccount)
  .post(validateCreateAccount, accountController.createAccount)
  .put(accountController.updateAccount)
  .delete(accountController.deleteAccount);
app
  .route("/auth")
  .post(validateLoginEmail, authController.loginEmail) // login
  .delete(authController.logoutEmail); // logout
app
  .route("/posts")
  .get(postsController.viewPosts)
  .post(
    s3upload.fields([
      { name: "original", maxCount: 1 },
      { name: "faces", maxCount: 3 },
    ]),
    validateCreatePost,
    postsController.createPost,
  );
app
  .route("/post/:id")
  .get(validateViewPost, postController.viewPost)
  .put(postController.editPost)
  .delete(postController.deletePost);
app.route("/post/:id/comment").post(commentController.createComment);
app.route("/friends").get(friendsController.viewFriends);
app
  .route("/friend/:id")
  .get(friendController.viewFriend)
  .delete(friendController.deleteFriend);
app.route("/images/:path").get(imageController.getImage);
app.route("/database").get(databaseController.syncDatabase);

// Error Handler (ALWAYS last)
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await AuthService.loadKeys();
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Server listening in port ${PORT}`);
  });
};

startServer();
