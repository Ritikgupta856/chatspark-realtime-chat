import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import Avatar from "../Avatar/Avatar";
import ImageViewer from "react-simple-image-viewer";
import { formateDate, wrapEmojisInHtmlTag } from "../../helper";
import "./Message.css";
import { Timestamp } from "firebase/firestore";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { users, data, imageViewer, setImageViewer } = useContext(ChatContext);
  const user = users[data.user.uid];

  const self = message?.senderId === currentUser?.uid;

  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  const timestamp = new Timestamp(
    message?.date?.seconds,
    message?.date?.nanoseconds
  );
  const date = timestamp.toDate();

  return (
    <div ref={ref} className={`message ${self && "owner"}`}>
      <div className="messageInfo">
        <Avatar size="small" user={self ? currentUser : user} />

        <span>{formateDate(date)}</span>
      </div>
      <div className="messageContent">
        {message.text && (
          <p
            dangerouslySetInnerHTML={{
              __html: wrapEmojisInHtmlTag(message.text),
            }}
          ></p>
        )}

        {message.img && (
          <img
            onClick={() =>
              setImageViewer({ msgId: message.id, url: message.img })
            }
            src={message.img}
            alt="not found"
          />
        )}
        {imageViewer && imageViewer.msgId === message.id && (
          <ImageViewer
            src={[imageViewer.url]}
            currentIndex={0}
            disableScroll={false}
            closeOnClickOutside={true}
            onClose={() => setImageViewer(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
