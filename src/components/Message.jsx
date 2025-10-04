import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { formateDate, wrapEmojisInHtmlTag } from "../helper";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { setImageViewer } = useContext(ChatContext);
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
      className={cn(
        "flex mb-2",
        self ? "justify-end" : "justify-start"
      )}
    >
      <Card
        className={cn(
          "relative max-w-[75%] rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md",
          self ? "bg-white rounded-br-none" : "bg-gray-50 rounded-bl-none"
        )}
      >
        <CardContent className="p-3 pb-2 flex flex-col gap-1">
          {/* Text */}
          {message.text && (
            <div
              className="text-[15px] leading-snug text-gray-800"
              dangerouslySetInnerHTML={{
                __html: wrapEmojisInHtmlTag(message.text),
              }}
            />
          )}

          {/* Image */}
          {message.img && (
            <img
              className="w-48 h-48 object-cover rounded-lg cursor-pointer transition-all hover:brightness-105"
              onClick={() =>
                setImageViewer({ msgId: message.id, url: message.img })
              }
              src={message.img}
              alt="message"
            />
          )}

          {/* Timestamp */}
          <span className="text-[11px] text-gray-500 mt-1 self-end">
            {formateDate(date)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

export default Message;
