
import ChatPanel from "../components/ChatPanel";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import { useChatContext } from "../context/ChatContext";
import Chats from "@/components/Chats";

function Home() {
  const { currentUser , isloading } = useContext(AuthContext);
  const { selectedChat } = useChatContext();

  if (isloading || !currentUser) {
    return <Loader />;
  }

  return (
    <div className="flex w-full h-screen max-h-screen overflow-hidden">

      <div className={`${selectedChat ? 'hidden lg:block' : 'block'} w-full lg:w-96 h-full`}>
        <Chats />
      </div>

     
      {selectedChat && (
        <div className="flex flex-grow h-full">
          <ChatPanel />
        </div>
      )}

 
      {!selectedChat && (
        <div className="hidden lg:flex flex-col justify-center items-center text-center flex-grow h-full p-5">
          <img
            className="w-[350px] h-[400px] object-contain"
            src="/logo.png"
            alt="ChatSpark Logo"
          />
          <h1 className="text-4xl font-semibold mt-4">Welcome To ChatSpark</h1>
          <p className="text-lg text-gray-500 mt-2 max-w-md">
            Join the conversation and connect with others.
          </p>
        </div>
      )}
    </div>
  );
}



export default Home