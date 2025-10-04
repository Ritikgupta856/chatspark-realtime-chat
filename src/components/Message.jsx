import React, { useEffect, useRef } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { AuthContext } from "../context/AuthContext";
import { formateDate, wrapEmojisInHtmlTag } from "../helper";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import "react-photo-view/dist/react-photo-view.css";

const Message = ({ message }) => {
  const { currentUser } = React.useContext(AuthContext);
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
    <div className={cn("flex mb-2", self ? "justify-end" : "justify-start")} ref={ref}>
      <Card
        className={cn(
          "relative max-w-[75%] rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md",
          self ? "bg-white rounded-br-none" : "bg-gray-50 rounded-bl-none"
        )}
      >
        <CardContent className="p-3 pb-2 flex flex-col gap-1">
          {message.text && (
            <div
              className="text-[15px] leading-snug text-gray-800"
              dangerouslySetInnerHTML={{
                __html: wrapEmojisInHtmlTag(message.text),
              }}
            />
          )}

          {message.img && (
            <PhotoProvider>
              <PhotoView src={message.img}>
                <img
                  src={message.img}
                  alt="message"
                  className="w-48 h-48 object-cover rounded-lg cursor-pointer transition-all hover:brightness-105"
                />
              </PhotoView>
            </PhotoProvider>
          )}

          <span className="text-[11px] text-gray-500 mt-1 self-end">
            {formateDate(date)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

export default Message;
