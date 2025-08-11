import React from "react";

import Messages from "./Messages";
import ChatHeader from "./ChatHeader";

import ChatFooter from "./ChatFooter";

const ChatPanel = () => {
  return (
    <div className="flex-grow flex flex-col bg-[#f4f3f8] relative">
      <ChatHeader />
      <Messages />
      <ChatFooter />
    </div>
  );
};

export default ChatPanel;
