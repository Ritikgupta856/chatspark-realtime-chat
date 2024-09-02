import React, { useContext} from 'react';
import Avatar from "../Avatar/Avatar";
import { ChatContext } from '../../context/ChatContext';
import './ChatHeader.css'

function ChatHeader() {
    const { users, data } = useContext(ChatContext);
    const online = users[data.user.uid]?.isOnline;
    const user = users[data.user.uid]; 

  return (
      <div className="chatInfo">

        < Avatar size="large" user={user} />

        <div className="user-info">

          <div className="name">{user?.displayName}</div>
          <p className="user-status">{online ? "online" : "offline"}</p>
        </div>
    </div>
  )
}

export default ChatHeader
