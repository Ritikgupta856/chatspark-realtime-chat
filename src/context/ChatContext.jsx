import React, { createContext, useContext, useReducer, useState } from "react";
import { AuthContext } from "./AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const INITIAL_STATE = {
    chatId: null,
    user: {},
  };

  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(false);
  const [imageViewer, setImageViewer] = useState(null);

  const deleteMessage = async (messageToDelete) => {
    if (!state.chatId) return;
    
    try {
      const chatRef = doc(db, "chats", state.chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const messages = chatDoc.data().messages || [];
        const updatedMessages = messages.filter(msg => 
          msg.date.seconds !== messageToDelete.date.seconds || 
          msg.senderId !== messageToDelete.senderId ||
          msg.text !== messageToDelete.text
        );
        
        await updateDoc(chatRef, {
          messages: updatedMessages
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId:
            currentUser.uid > action.payload.uid
              ? currentUser.uid + action.payload.uid
              : action.payload.uid + currentUser.uid,
        };

      case "EMPTY":
        return INITIAL_STATE;

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider
      value={{
        data: state,
        dispatch,
        chats,
        setChats,
        users,
        setUsers,
        selectedChat,
        setSelectedChat,
        deleteMessage,
        imageViewer,
        setImageViewer,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);