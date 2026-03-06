import { httpsErrors } from "../../errors/httpsErrors.js";
import Message from "../models/Message.js";
import sanitizeHtml from "sanitize-html";
import User from "../models/User.js";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { sendMessageService } from "../services/message.service.js";

export const sanitizeText = (text = "") => {
  if (typeof text !== "string") {
    return "";
  }
  const cleanText = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: [],
  });
  return cleanText
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
};

export const sendMessage = async (req, res, next) => {
  try {
    const { body, chatId } = req.body;
    const fromId = req.user._id;

    await sendMessageService(fromId, chatId, body);

    return res.status(201).json({ message: "message sent" });
  } catch (error) {
    return next(error);
  }
};

export const getChatMessages = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id.toString();

  try {
    if (!chatId) {
      return next(new httpsErrors(400, "chatId is required"));
    }

    const chat = await Chat.findById(chatId).populate("participants");
    if (!chat) {
      return next(new httpsErrors(404, "Chat not found"));
    }

    const isParticipant = chat.participants.some(
      (user) => user._id.toString() === userId,
    );
    if (!isParticipant) {
      return next(new httpsErrors(403, "You are not part of this chat"));
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    if (!messages || messages.length === 0) {
      return next(new httpsErrors(404, "No messages found"));
    }

    const newMessages = messages.map((msg) => {
      const m = msg.toObject();
      if (m.senderId.toString() === userId) {
        m.senderId = "sender";
      }
      return m;
    });

    res.status(200).json(newMessages);
  } catch (error) {
    console.error(error);
    return next(new httpsErrors(500, "Server error"));
  }
};
