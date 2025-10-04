
import ChatPanel from "../components/ChatPanel";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import { useChatContext } from "../context/ChatContext";
import Chats from "@/components/Chats";

function Home() {
  const { currentUser } = useContext(AuthContext);
  const { selectedChat } = useChatContext();

  return !currentUser ? (
    <Loader />
  ) : (
    <div className="flex w-full h-screen overflow-hidden">

      <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto`}>
        <Chats />
      </div>

      {selectedChat && (
        <div className="flex lg:hidden w-full">
          <ChatPanel />
        </div>
      )}

      {selectedChat && (
        <div className="hidden lg:flex flex-grow">
          <ChatPanel />
        </div>
      )}

      {!selectedChat && (
        <div className="hidden lg:flex flex-col justify-center items-center text-center m-auto p-5">
          <img className="w-[230px] h-[170px]" src="/logo.png" alt="logo" />
          <h1 className="text-4xl font-semibold mt-4">Welcome To ChatSpark</h1>
          <p className="text-lg text-gray-500 mt-2">
            Join the conversation and connect with others.
          </p>
        </div>
      )}
    </div>
  );
}



export default Home