import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import accountController from "./controllers/account";

// Config
dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Controllers
app
  .route("/account")
  .get(accountController.viewMyAccount)
  .post(accountController.createAccount)
  .put(accountController.updateAccount)
  .delete(accountController.deleteAccount);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening in port ${PORT}`);
});
