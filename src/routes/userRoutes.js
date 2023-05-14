import express from "express";
import {
  createUserByMail,
  deleteUserById,
  forgotPasswordByMail,
  getAllUsers,
  getUserById,
  resetPasswordByMail,
  signinUser,
  updateUserById,
  verifyUserByMail,
} from "../controllers/userControllers.js";
const userRoutes = express.Router();

userRoutes.post("/signin", signinUser);
userRoutes.get("/", getAllUsers);
userRoutes.get("/:userId", getUserById);
userRoutes.put("/:userId", updateUserById);
userRoutes.delete("/:userId", deleteUserById);

userRoutes.post("/forgot_password-mail", forgotPasswordByMail);
userRoutes.post("/reset_password-mail/:token", resetPasswordByMail);

userRoutes.post("/create-user-mail", createUserByMail);
userRoutes.post("/verify-user-mail", verifyUserByMail);

export default userRoutes;
