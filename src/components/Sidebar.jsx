import Chats from "./Chats";
import React from "react";

function Sidebar() {
  return (
    <div className="flex-grow max-w-[340px] border-r border-black/5 bg-[#f4f3f8]">
      <Chats />
    </div>
  );
}

export default Sidebar;
