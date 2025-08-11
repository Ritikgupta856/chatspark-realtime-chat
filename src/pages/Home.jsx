
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/ChatPanel";
import React, { useContext } from "react";
import LeftNav from "../components/LeftNav";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import { useChatContext } from "../context/ChatContext";

function Home() {
  const { currentUser } = useContext(AuthContext);
  const { selectedChat } = useChatContext();

  return !currentUser ? (
    <Loader />
  ) : (
    <div className="flex w-full h-screen">
      <LeftNav />
      <Sidebar />
      {selectedChat ? (
        <ChatPanel />
      ) : (
        <div className="flex flex-col justify-center items-center text-center m-auto p-5">
          <img className="w-[230px] h-[170px]" src="/logo.png" alt="logo" />
          <h1 className="text-4xl font-semibold mt-4">Welcome To ChatSpark</h1>
          <p className="text-lg text-gray-500 mt-2">Join the conversation and connect with others.</p>
        </div>
      )}
    </div>
  );
}

export default Home;
