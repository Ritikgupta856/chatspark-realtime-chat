import {
  createContext,
  useContext,
  useReducer,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import React from 'react';

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
const [text, setText] = useState("");
const [attachment, setAttachment] = useState(null);
const [attachmentPreview, setAttachmentPreview] = useState(null);
const [imageViewer, setImageViewer] = useState(null);

const resetFooterStates = () => {
  setText("");
  setAttachment(null);
  setAttachmentPreview(null);
  setImageViewer(null);
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

       case "EMPTY" : 
             return INITIAL_STATE ;

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider
      value={{
        chats, 
        setChats,
        data: state,
        dispatch,
        users,setUsers,
        selectedChat,
        setSelectedChat,
        text,
        setText,
        attachment,
        setAttachment,
        attachmentPreview,
        setAttachmentPreview,
        imageViewer,
        setImageViewer,
        resetFooterStates
      }}>
      {children}
    </ChatContext.Provider>
  );
}
export const useChatContext = () => useContext(ChatContext)