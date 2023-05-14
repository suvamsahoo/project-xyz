import express from "express";
import {
  createUserByMail,
  deleteUserById,
  getAllUsers,
  getUserById,
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

userRoutes.post("/create-user-mail", createUserByMail);
userRoutes.post("/verify-user-mail", verifyUserByMail);

export default userRoutes;
