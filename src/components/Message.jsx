import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import Avatar from "./Avatar";
import { formateDate, wrapEmojisInHtmlTag } from "../helper";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { users, data, setImageViewer } = useContext(ChatContext);

  const user = users?.[data?.user?.uid];
  const self = message?.senderId === currentUser?.uid;

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const timestamp = new Timestamp(
    message?.date?.seconds,
    message?.date?.nanoseconds
  );
  const date = timestamp.toDate();

  return (
    <div
      ref={ref}
      className={cn("flex gap-3 items-end", self && "flex-row-reverse")}
    >
      {/* Avatar */}
      <Avatar size="small" user={self ? currentUser : user} />

      {/* Bubble */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[65%] break-words",
          self && "items-end"
        )}
      >
        {message.text && (
          <div
            className={cn(
              "px-3 py-2 rounded-lg shadow-sm text-sm relative",
              self
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-muted rounded-bl-none"
            )}
            dangerouslySetInnerHTML={{
              __html: wrapEmojisInHtmlTag(message.text),
            }}
          />
        )}

        {message.img && (
          <img
            className="w-48 h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
            onClick={() =>
              setImageViewer({ msgId: message.id, url: message.img })
            }
            src={message.img}
            alt="message"
          />
        )}

        {/* Time */}
        <span className="text-[10px] text-muted-foreground">
          {formateDate(date)}
        </span>
      </div>
    </div>
  );
};

export default Message;
