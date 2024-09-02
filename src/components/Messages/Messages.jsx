import React, { useContext, useEffect, useState } from 'react';
import Message from '../Message/Message';
import "./Messages.css";
import { ChatContext } from '../../context/ChatContext';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';



function Messages() {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []); 
      } else {
        setMessages([]); 
      }
    
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  return (
    <div className="messages">
      {messages
        ?.filter((m) => {
          return true; 
        })
        ?.map((m) => (
          <Message message={m} key={m.id} onDelete={m} />
        ))}
         
    </div>
  );
}

export default Messages;
