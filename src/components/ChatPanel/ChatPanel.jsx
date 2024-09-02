import React from "react";

import Messages from "../Messages/Messages";
import ChatHeader from "../ChatHeader/ChatHeader";
import "./ChatPanel.css"
import ChatFooter from "../ChatFooter/ChatFooter";

const ChatPanel = () => {


  return (
    <div className="ChatPanel">
      <ChatHeader />
      <Messages />
      <ChatFooter/>
    </div>
  );
};

export default ChatPanel;
