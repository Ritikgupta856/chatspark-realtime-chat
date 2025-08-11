import React from "react";
import { useParams } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";
import Messages from "../components/Messages";
import ChatFooter from "../components/ChatFooter";


const ChatPage = () => {
  const { chatId } = useParams();

  // You can fetch chat-specific data here if needed

  return (
    <div className="flex flex-col h-screen bg-[#f4f3f8]">
    
      <ChatHeader />
      <div className="flex-1 overflow-auto">
        <Messages chatId={chatId} />
      </div>
      <ChatFooter chatId={chatId} />
    </div>
  );
};

export default ChatPage;
