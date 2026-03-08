import express from "express";
import {
  login,
  logout,
  register,
  searchUsers,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import { authLimiter, searchLimiter } from "../middleware/authLimiter.js";
import jwt from "jsonwebtoken";

const userRoute = express.Router();

userRoute.post("/sign-up", authLimiter, register);
userRoute.post("/login", authLimiter, login);
userRoute.post("/logout", protect, logout);
userRoute.get("/searchUsers", searchLimiter, protect, searchUsers);
userRoute.get("/me", protect, (req, res) => {
  res.status(200).json(req.user);
});
userRoute.get("/token", protect, (req, res) => {
  const token = jwt.sign(
    { id: req.user._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }
  );
  res.status(200).json({ token });
});

export default userRoute;
