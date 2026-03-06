import express from "express";
import { createChat, deleteChat, getChats } from "../controllers/chatController.js";
import protect from "../middleware/authMiddleware.js";

const chatRoute = express.Router();

chatRoute.post('/createChat',protect,createChat);

chatRoute.get('/getChats',protect,getChats);

chatRoute.delete('/deleteChat/:chatId',protect,deleteChat);

export default chatRoute;
