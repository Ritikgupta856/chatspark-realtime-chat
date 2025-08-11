import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { useChatContext } from "../context/ChatContext";
import { db } from "@/firebase";

import { AiFillCamera } from "react-icons/ai";
import { RiSearch2Line } from "react-icons/ri";
import Avatar from "./Avatar";
import { formateDate } from "../helper";

// shadcn components
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const Chats = () => {
  const { users, setUsers, chats, setChats, setSelectedChat, data, resetFooterStates } = useChatContext();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const [search, setSearch] = useState("");
  const [unreadMsgs, setUnreadMsgs] = useState({});

  // Fetch users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const updatedUsers = {};
      snapshot.forEach((doc) => (updatedUsers[doc.id] = doc.data()));
      setUsers(updatedUsers);
    });
    return unsubscribe;
  }, [setUsers]);

  // Fetch chats
  useEffect(() => {
    if (!currentUser.uid) return;
    const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => setChats(doc.data()));
    return unsub;
  }, [currentUser.uid, setChats]);

  // Listen unread messages
  useEffect(() => {
    const documentIds = Object.keys(chats);
    if (!documentIds.length) return;

    const q = query(collection(db, "chats"), where("__name__", "in", documentIds));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = {};
      snapshot.forEach((doc) => {
        if (doc.id !== data.chatId) {
          msgs[doc.id] = doc.data().messages.filter(
            (m) => !m.read && m.sender !== currentUser.uid
          );
        }
        Object.keys(msgs).forEach((c) => {
          if (!msgs[c]?.length) delete msgs[c];
        });
      });
      setUnreadMsgs(msgs);
    });

    return () => unsub();
  }, [chats, currentUser.uid, data.chatId]);

  useEffect(() => {
    resetFooterStates();
  }, [data?.chatId, resetFooterStates]);

  // Read chat
  const readChat = async (chatId) => {
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);
    const updatedMessages = chatDoc.data().messages.map((m) =>
      m.read ? m : { ...m, read: true }
    );
    await updateDoc(chatRef, { messages: updatedMessages });
  };

  // Select chat
  const handleSelect = (u, selectedChatId) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    setSelectedChat(true);
    if (unreadMsgs[selectedChatId]?.length > 0) {
      readChat(selectedChatId);
    }
    navigate(`/chat/${selectedChatId}`);
  };

  // Filtered chats
  const filteredChats = useMemo(() => {
    return Object.entries(chats || {})
      .filter(
        ([, chat]) =>
          chat?.userInfo?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
          chat?.lastMessage?.text?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b[1].date - a[1].date);
  }, [chats, search]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 p-2">
        {Object.keys(users || {}).length > 0 &&
          filteredChats.map(([chatId, chat]) => {
            const timestamp = new Timestamp(chat.date?.seconds, chat.date?.nanoseconds);
            const date = timestamp.toDate();
            const user = users[chat.userInfo.uid];

            return (
              <div
                key={chatId}
                onClick={() => handleSelect(chat.userInfo, chatId)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Avatar size="large" user={user} />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate capitalize">{user?.displayName}</span>
                    <span className="text-xs text-muted-foreground">{formateDate(date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      {chat?.lastMessage?.img ? (
                        <>
                          <AiFillCamera className="text-blue-500" /> Photo
                        </>
                      ) : (
                        chat?.lastMessage?.text
                      )}
                    </p>
                    {!!unreadMsgs[chatId]?.length && (
                      <Badge variant="destructive" className="rounded-full px-2">
                        {unreadMsgs[chatId]?.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </ScrollArea>
    </div>
  );
};

export default Chats;
