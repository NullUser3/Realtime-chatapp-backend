import express from "express";
import {
  getChatMessages,
  sendMessage,
} from "../controllers/messageController.js";
import protect from "../middleware/authMiddleware.js";

const messageRoute = express.Router();

messageRoute.post("/", protect, sendMessage);
messageRoute.get("/:chatId", protect, getChatMessages);

export default messageRoute;
