import React, { useContext } from "react";
import Avatar from "./Avatar";
import { ChatContext } from "../context/ChatContext";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function ChatHeader() {
  const { users, data } = useContext(ChatContext);
  const user = users?.[data?.user?.uid];
  const online = user?.isOnline;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-14 bg-muted text-muted-foreground">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="flex items-center gap-3 px-4 h-14">
        <Avatar size="large" user={user} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium capitalize truncate">{user?.displayName}</span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                online ? "bg-green-500" : "bg-gray-400"
              )}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <Separator />
    </div>
  );
}

export default ChatHeader;
