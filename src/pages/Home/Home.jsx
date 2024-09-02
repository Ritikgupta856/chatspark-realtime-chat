import "./home.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatPanel from "../../components/ChatPanel/ChatPanel";
import React, { useContext } from "react";
import LeftNav from "../../components/LeftNav/LeftNav";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../img/logo.png";

import Loader from "../../components/Loader/Loader";
import { useChatContext } from "../../context/ChatContext";

function Home() {
  const { currentUser } = useContext(AuthContext);
  const { selectedChat } = useChatContext();

  return !currentUser ? (
    <Loader />
  ) : (
    <div className="main-container">
      <LeftNav />
      <Sidebar />
      {selectedChat ? (
        <ChatPanel />
      ) : (
        <div className="welcome-container">
          <img className="welcome-logo" src={logo} alt="logo" />
          <h1>Welcome To ChatSpark</h1>
          <p>Join the conversation and connect with others.</p>
        </div>
      )}
    </div>
  );
}

export default Home;
