import React from "react";
import Messages from "./Messages";
import ChatHeader from "./ChatHeader";
import ChatFooter from "./ChatFooter";

const ChatPanel = () => {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
      <ChatHeader />
      <Messages />
      <ChatFooter />
    </div>
  );
};

export default ChatPanel;