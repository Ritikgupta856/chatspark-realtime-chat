import React from "react";

import Messages from "./Messages";
import ChatHeader from "./ChatHeader";

import ChatFooter from "./ChatFooter";

const ChatPanel = () => {
  return (
    <div className="flex-grow flex flex-col relative">
      <ChatHeader />
      <Messages />
      <ChatFooter />
    </div>
  );
};

export default ChatPanel;
