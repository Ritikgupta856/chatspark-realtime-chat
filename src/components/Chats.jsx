import { Button } from "./ui/button";
import { Plus, Settings, LogOut } from "lucide-react";
import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { useChatContext } from "../context/ChatContext";
import { db } from "@/firebase";

import { AiFillCamera } from "react-icons/ai";
import { RiSearch2Line } from "react-icons/ri";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formateDate } from "../helper";

// shadcn components
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import EditProfile from "./EditProfile";
import AddUser from "./AddUser";

function Chats() {
  const {
    users,
    setUsers,
    chats,
    setChats,
    setSelectedChat,
  } = useChatContext();
  const navigate = useNavigate();
  const { currentUser, signOut } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const [search, setSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

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
    if (!currentUser?.uid) return;
    const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
      const data = doc.data();
      setChats(data || {});
    });
    return unsub;
  }, [currentUser?.uid, setChats]);

  // Select chat
  const handleSelect = (u, selectedChatId) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    setSelectedChat(true);
  };

  // Filtered chats
  const filteredChats = useMemo(() => {
    return Object.entries(chats || {})
      .filter(
        ([, chat]) =>
          chat?.userInfo?.displayName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          chat?.lastMessage?.text?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b[1].date - a[1].date);
  }, [chats, search]);

  const handleAddUser = () => {
    setShowAddUser(true);
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col w-full lg:w-96 h-full border-r border-gray-200 bg-white">
      {/* Header Section */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddUser}
              className="h-9 w-9 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
              aria-label="Add new user"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditProfile}
              className="h-9 w-9 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
              aria-label="Edit profile"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 cursor-pointer text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">
            {Object.keys(users || {}).length > 0 ? (
              filteredChats.length > 0 ? (
                filteredChats.map(([chatId, chat]) => {
                  const timestamp = new Timestamp(
                    chat.date?.seconds,
                    chat.date?.nanoseconds
                  );
                  const date = timestamp.toDate();
                  const user = users[chat.userInfo.uid];

                  return (
                    <div
                      key={chatId}
                      onClick={() => handleSelect(chat.userInfo, chatId)}
                      className={cn(
                        "flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all duration-200 group",
                        "hover:bg-gray-50 active:bg-gray-100"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage
                            src={user?.photoURL}
                            alt={user?.displayName || "User"}
                            className="object-cover"
                          />
                          <AvatarFallback
                            className="text-white font-semibold text-sm"
                            style={{
                              backgroundColor: user?.color || "#6B7280",
                            }}
                          >
                            {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        {user && (
                          <span
                            className={cn(
                              "absolute -bottom-0 right-1 h-3 w-3 rounded-full border-2 border-white",
                              user.isOnline ? "bg-green-500" : "bg-gray-400"
                            )}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex-1 min-w-0 mr-2">
                            <h3 className="font-semibold text-gray-900 truncate capitalize text-sm">
                              {user?.displayName || "Unknown User"}
                            </h3>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formateDate(date)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              {chat?.lastMessage?.img ? (
                                <>
                                  <AiFillCamera className="text-gray-400 flex-shrink-0" />
                                  <span>Photo</span>
                                </>
                              ) : (
                                <span className="truncate block">
                                  {chat?.lastMessage?.text || "No messages yet"}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="text-gray-400 mb-2">
                    <RiSearch2Line className="h-12 w-12" />
                  </div>
                  <p className="text-gray-500 text-center">
                    {search ? "No conversations found" : "No conversations yet"}
                  </p>
                  <p className="text-gray-400 text-sm text-center mt-1">
                    {search
                      ? "Try a different search term"
                      : "Start a new conversation"}
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Loading conversations...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Modals */}
      <AddUser isOpen={showAddUser} onClose={() => setShowAddUser(false)} />
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </div>
  );
}

export default Chats;