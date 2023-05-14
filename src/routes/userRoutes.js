import express from "express";
import { createUserByMail, getAllUsers, verifyUserByMail } from "../controllers/userControllers.js";
const userRoutes = express.Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/create-user-mail", createUserByMail);
userRoutes.post("/verify-user-mail", verifyUserByMail);

export default userRoutes;
