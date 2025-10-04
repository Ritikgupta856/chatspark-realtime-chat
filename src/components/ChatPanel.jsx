import React from "react";
import Messages from "./Messages";
import ChatHeader from "./ChatHeader";
import ChatFooter from "./ChatFooter";

const ChatPanel = () => {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background">
      <div className="flex-shrink-0">
        <ChatHeader />
      </div>
      <div className="flex-1 overflow-hidden">
        <Messages />
      </div>
      <div className="flex-shrink-0">
        <ChatFooter />
      </div>
    </div>
  );
};

export default ChatPanel;
