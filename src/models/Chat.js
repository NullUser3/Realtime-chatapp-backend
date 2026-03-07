import mongoose from "mongoose";

const ChatSchema = mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "User",
      validate: {
        validator: (arr) => arr.length >= 2,
        message: "participants must be 2 or more",
      },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  { timestamps: true },
);

// Prevent duplicate 1-to-1 chats (participants must be sorted!)
ChatSchema.index(
  { participants: 1 },
  { unique: true, partialFilterExpression: { isGroup: false } },
);

// Optional: fast queries for non-deleted chats
ChatSchema.index({ deletedFor: 1 });

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
