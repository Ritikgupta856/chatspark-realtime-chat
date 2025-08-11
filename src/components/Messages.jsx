import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area"; // shadcn component

function Messages() {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    if (!data.chatId) return;

    const unSub = onSnapshot(doc(db, "chats", data.chatId), (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().messages || []);
      } else {
        setMessages([]);
      }
    });

    return () => unSub();
  }, [data.chatId]);

  return (
    <ScrollArea className="bg-[#f4f3f8] px-4 py-3 h-[calc(100%-130px)] rounded-b-lg">
      <div className="flex flex-col gap-4">
        {messages.length > 0 ? (
          messages.map((m) => (
            <Message message={m} key={m.id} onDelete={m} />
          ))
        ) : (
          <div className="text-center text-sm text-gray-400 mt-10">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export default Messages;
