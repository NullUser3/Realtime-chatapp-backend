import mongoose from "mongoose";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { httpsErrors } from "../../errors/httpsErrors.js";
import { sanitizeText } from "../controllers/messageController.js";

export const sendMessageService = async (fromId, chatId, body) => {
  if (!chatId || !body) {
    throw new httpsErrors(400, "Missing required fields");
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new httpsErrors(400, "Invalid chatId");
  }

  const chatRoom = await Chat.findById(chatId);

  if (!chatRoom) {
    throw new httpsErrors(404, "Chat not found");
  }

  const isParticipant = chatRoom.participants.some(
    (p) => p.toString() === fromId.toString(),
  );

  if (!isParticipant) {
    throw new httpsErrors(403, "User not part of this chat");
  }

  const cleanText = sanitizeText(body);

  if (cleanText.length === 0) {
  throw new httpsErrors(400, "Message cannot be empty");
}

if (cleanText.length > 2000) {
  throw new httpsErrors(400, "Message too long (max 2000 characters)");
}

  const message = await Message.create({
    senderId: fromId,
    chatId: chatRoom._id,
    body: cleanText,
  });

  chatRoom.lastMessage = message._id;
  chatRoom.updatedAt = new Date();

  await chatRoom.save();


  return {
  ...message.toObject(),
  lastMessage: message,
  updatedAt: chatRoom.updatedAt,
};
};
