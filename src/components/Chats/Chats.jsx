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
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useChatContext } from "../../context/ChatContext";
import { db } from "../../firebase";
import { AiFillCamera } from "react-icons/ai";
import Avatar from "../Avatar/Avatar";
import "./Chats.css";

import { RiSearch2Line } from "react-icons/ri";
import { formateDate } from "../../helper";

const Chats = () => {
  const {
    users,
    setUsers,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    data,
    resetFooterStates
  } = useChatContext();

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const [search, setSearch] = useState("");
  const [unreadMsgs, setUnreadMsgs] = useState({});
  

  useEffect(() => {
    onSnapshot(collection(db, "users"), (Snapshot) => {
      const updatedUsers = {};
      Snapshot.forEach((doc) => {
        updatedUsers[doc.id] = doc.data();
      });
      setUsers(updatedUsers);
    });

    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid, setChats, setUsers]);

  useEffect(() => {
    const documentIds = Object.keys(chats);

    if (documentIds.length === 0) return;
    const q = query(
      collection(db, "chats"),
      where("__name__", "in", documentIds)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let msgs = {};
      snapshot.forEach((doc) => {
        if (doc.id !== data.chatId) {
          msgs[doc.id] = doc
            .data()
            .messages.filter(
              (m) => m?.read === false && m?.sender !== currentUser.uid
            );
        }

        Object.keys(msgs || {})?.map((c) => {
          if (msgs[c]?.length < 1) {
            delete msgs[c];
          }
        });
      });
      setUnreadMsgs(msgs);
    });
    return () => unsub();
  }, [chats, selectedChat, currentUser.uid, data.chatId]);

  useEffect(() => {
    resetFooterStates();
}, [data?.chatId]);


  const readChat = async (chatId) => {
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);
    let updatedMessages = chatDoc.data().messages?.map((m) => {
      if (m?.read === false) {
        m.read = true;
      }

      return m;
    });
    await updateDoc(chatRef, {
      messages: updatedMessages,
    });
  };

  const handleSelect = (u, selectedChatId) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    setSelectedChat(true);
    if (unreadMsgs?.[selectedChatId]?.length > 0) {
      readChat(selectedChatId);
    }
  };

  const filteredChats = Object.entries(chats || {})

    .filter(
      ([, chat]) =>
        chat?.userInfo?.displayName
          ?.toLowerCase()
          .includes(search?.toLowerCase()) ||
        chat?.lastMessage?.text?.toLowerCase().includes(search?.toLowerCase())
    )
    .sort((a, b) => b[1].date - a[1].date);

  return (
    <>
      <div className="search">
        <RiSearch2Line
          style={{ position: "absolute", top: "24px", left: "25px" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Username..."
        />
      </div>

      <div className="chats">
        {Object.keys(users || {}).length > 0 &&
          filteredChats?.map((chat) => {
            const timestamp = new Timestamp(
              chat[1]?.date?.seconds,
              chat[1]?.date?.nanoseconds
            );
            const date = timestamp.toDate();

            const user = users[chat[1].userInfo.uid];

            return (
              <div
                className="userChat"
                key={chat[0]}
                onClick={() => handleSelect(chat[1].userInfo, chat[0])}
              >
                <Avatar size="large" user={user} />

                <div className="userChatInfo">
                  <span className="name">{user?.displayName}</span>
                  <p>
                    {chat[1]?.lastMessage?.img ? (
                      <div className="type">
                        <AiFillCamera /> Photo
                      </div>
                    ) : (
                      chat[1]?.lastMessage?.text
                    )}
                  </p>

                  <span className="date">{formateDate(date)}</span>
                  {!!unreadMsgs?.[chat[0]]?.length && (
                    <span className="alert">
                      {unreadMsgs?.[chat[0]]?.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Chats;
