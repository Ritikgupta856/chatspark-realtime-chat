import React, { useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatContext, useChatContext } from "../context/ChatContext";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function ChatHeader() {
  const { users, data } = useContext(ChatContext);
  const { setSelectedChat } = useChatContext();
  const user = users?.[data?.user?.uid];
  const online = user?.isOnline;

  const handleBack = () => {
    setSelectedChat(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-14 bg-muted text-muted-foreground">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="flex items-center gap-3 p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="lg:hidden h-9 w-9 flex-shrink-0 -ml-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Avatar with online dot below */}
        <div className="relative flex flex-col items-center">
          <Avatar className="h-10 w-10 lg:h-12 lg:w-12">
            <AvatarImage src={user?.photoURL} alt="avatar" />
            <AvatarFallback
              className="text-white lg:text-lg"
              style={{ backgroundColor: user?.color }}
     
            >
              {user?.displayName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Online/Offline dot below avatar */}
          <span
            className={cn(
              "absolute -bottom-0 right-1 h-2.5 w-2.5 rounded-full border-2 border-white",
              online ? "bg-green-500" : "bg-gray-400"
            )}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium capitalize truncate">
            {user?.displayName}
          </span>
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
