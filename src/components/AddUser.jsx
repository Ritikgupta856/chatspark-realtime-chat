// AddUser.jsx (UI-only refinements)
import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { AuthContext } from "@/context/AuthContext";
import { ChatContext } from "@/context/ChatContext";

const SkeletonRow = () => (
  <div className="flex items-center gap-3 p-3 rounded-lg border bg-white/50">
    <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
  </div>
);

const AddUser = ({ isOpen, onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const { users } = useContext(ChatContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", term),
        where("displayName", "<=", term + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const results = [];

      querySnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        if (docSnap.id !== currentUser.uid) {
          results.push({ id: docSnap.id, ...userData });
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (user) => {
    setCreating(true);
    try {
      const combinedId =
        currentUser.uid > user.id
          ? currentUser.uid + user.id
          : user.id + currentUser.uid;

      const chatRef = doc(db, "chats", combinedId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        await setDoc(chatRef, { messages: [] });

        const currentUserChatRef = doc(db, "userChats", currentUser.uid);
        const currentUserChatDoc = await getDoc(currentUserChatRef);
        const currentUserChatData = currentUserChatDoc.exists()
          ? currentUserChatDoc.data()
          : {};

        await updateDoc(currentUserChatRef, {
          ...currentUserChatData,
          [combinedId]: {
            userInfo: {
              uid: user.id,
              displayName: user.displayName,
               photoURL: user.photoURL || null,
            },
            date: serverTimestamp(),
            lastMessage: { text: "" },
          },
        });

        const otherUserChatRef = doc(db, "userChats", user.id);
        const otherUserChatDoc = await getDoc(otherUserChatRef);
        const otherUserChatData = otherUserChatDoc.exists()
          ? otherUserChatDoc.data()
          : {};

        await updateDoc(otherUserChatRef, {
          ...otherUserChatData,
          [combinedId]: {
            userInfo: {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL || null,
            },
            date: serverTimestamp(),
            lastMessage: { text: "" },
          },
        });

        toast.success(`Chat created with ${user.displayName}`);
      } else {
        toast.error(`Chat with ${user.displayName} already exists`);
      }

      onClose();
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="flex flex-col">
            <span className="text-base">Add new chat</span>
            <span className="text-sm font-normal text-muted-foreground mt-1">
              Search by name to start a conversation
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none transition-opacity"
              aria-hidden="true"
            />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10 h-10 rounded-md border-input focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Search users"
            />
          </div>

          {/* Search Results */}
          <div className="min-h-[220px] max-h-[340px]">
            {loading ? (
              <div className="space-y-2">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : searchResults.length > 0 ? (
              <ScrollArea className="h-full pr-1">
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
                    >
                      <Avatar className="h-9 w-9 ring-1 ring-border">
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName}
                        />
                        <AvatarFallback
                          className="text-white"
                          style={{ backgroundColor: user.color || "#6B7280" }}
                        >
                          {user.displayName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.displayName}</p>
                        {user.email && (
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleCreateChat(user)}
                        disabled={creating}
                        className="shrink-0 transition-all group-hover:translate-x-0.5"
                        aria-label={`Add ${user.displayName}`}
                      >
                        <UserPlus className="h-4 w-4 mr-1 opacity-80" />
                        {creating ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : searchTerm ? (
              <div className="flex flex-col items-center justify-center pt-10 h-full text-muted-foreground">
                <div className="h-10 w-10 rounded-full grid place-items-center bg-muted mb-2">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full pt-10 text-muted-foreground">
                <div className="h-10 w-10 rounded-full grid place-items-center bg-muted mb-2">
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm">Search for users to start chatting</p>
              
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUser;
