import express from "express";
import {
  createChat,
  deleteChat,
  getChats,
} from "../controllers/chatController.js";
import protect from "../middleware/authMiddleware.js";

const chatRoute = express.Router();

chatRoute.post("/", protect, createChat);

chatRoute.get("/", protect, getChats);

chatRoute.delete("/:chatId", protect, deleteChat);

export default chatRoute;
