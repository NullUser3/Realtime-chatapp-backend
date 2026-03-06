import { httpsErrors } from "../../errors/httpsErrors.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const createChat = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (receiverId.toString() === senderId.toString()) {
      return next(new httpsErrors(400, ": cant create a chat with yourself"));
    }

    const receiver = await User.findById(receiverId).select(
      "username avatar lastSeen",
    );
    if (!receiver) {
      return next(new httpsErrors(404, ": receiver not found"));
    }

    const participants = [senderId.toString(), receiver._id.toString()].sort();

    let chat = await Chat.findOne({ participants, isGroup: false })
      .populate("participants", "username avatar lastSeen avatarColor")
      .populate({ path: "lastMessage", select: "body createdAt sender" });

    if (!chat) {
      chat = await Chat.create({ participants, sender: senderId });
      chat = await chat.populate([
        { path: "participants", select: "username avatar lastSeen avatarColor" },
        { path: "lastMessage", select: "body createdAt sender" },
      ]);
    }

    await Chat.findByIdAndUpdate(chat._id, {
      $pull: { deletedFor: senderId },
    });

    const chatObj = chat.toObject();

    const receiverObj = chatObj.participants.find(
      (user) => user._id.toString() !== senderId.toString(),
    );

    if (chatObj.lastMessage?.createdAt) {
      chatObj.lastMessage.readableTime = new Date(
        chatObj.lastMessage.createdAt,
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const response = {
      chatId: chatObj._id,
      lastMessage: chatObj.lastMessage,
      receiver: receiverObj,
    };

    res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
};

export const getChats = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const chats = await Chat.find({
      participants: userId,
      isGroup: false,
      deletedFor: { $ne: userId },
    })
      .populate("participants", "username avatar lastSeen avatarColor")
      .populate({ path: "lastMessage", select: "body createdAt sender" });

    if (chats.length === 0) {
      return next(new httpsErrors(404));
    }

    const receivers = chats.map((chatDoc) => {
      const chat = chatDoc.toObject();

      const receiver = chat.participants.find(
        (user) => user._id.toString() !== userId.toString(),
      );

      // if (chat.lastMessage?.createdAt) {
      //   chat.lastMessage.readableTime = new Date(chat.lastMessage.createdAt)
      //     .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // }

      return {
        chatId: chat._id,
        lastMessage: chat.lastMessage,
        receiver,
      };
    });

    res.status(200).json(receivers);
  } catch (error) {
    return next(new httpsErrors(500));
  }
};

export const deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return next(new httpsErrors(404, ": chat not found"));
    }

    // Make sure user is part of the chat
    if (!chat.participants.includes(userId)) {
      return next(new httpsErrors(403, ": unauthorized"));
    }

    // Soft delete (avoid duplicates)
    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { deletedFor: userId },
    });

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
