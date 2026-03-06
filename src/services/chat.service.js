import Chat from "../models/Chat";
import User from "../models/User";


export const createChatService = async (senderId,receiverId) => {

  try {

    const receiver = await User.findById(receiverId);
    if (!receiver) {
     throw new httpsErrors(404, ": receiver not found");
    }

    const participants = [senderId.toString(), receiver._id.toString()].sort();

    const checkChat = await Chat.findOne({ participants, isGroup: false });

    if(checkChat){
        return checkChat;
    }

    const chat = await Chat.create({
        participants
    });
    
    return chat;

  } catch (error) {
    throw error;
  }
}