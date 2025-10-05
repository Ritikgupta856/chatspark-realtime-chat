import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useChatContext } from "../context/ChatContext";
import { BsEmojiSmile } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import { RiImageAddFill } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import { IoSend } from "react-icons/io5";
import ClickAwayListener from "react-click-away-listener";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ChatFooter = () => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useChatContext();
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [emoji, setEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isChatSelected = data?.chatId && data?.user?.uid;

  useEffect(() => {
    setText("");
    setAttachment(null);
    setAttachmentPreview(null);
  }, [data?.chatId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isChatSelected) handleSend();
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
    if (file) setAttachmentPreview(URL.createObjectURL(file));
  };

  const handleSend = async () => {
    if (!text.trim() && !attachment) return;
    if (!isChatSelected) return;

    try {
      setIsUploading(true);

      if (attachment) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, attachment);

        uploadTask.on("state_changed", null, console.error, async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(doc(db, "chats", data.chatId), {
            messages: arrayUnion({
              id: uuid(),
              text: text.trim(),
              senderId: currentUser.uid,
              date: Timestamp.now(),
              img: downloadURL,
            }),
          });

          const lastMessage = { img: downloadURL };
          await Promise.all([
            updateDoc(doc(db, "userChats", currentUser.uid), {
              [data.chatId + ".lastMessage"]: lastMessage,
              [data.chatId + ".date"]: serverTimestamp(),
            }),
            updateDoc(doc(db, "userChats", data.user.uid), {
              [data.chatId + ".lastMessage"]: lastMessage,
              [data.chatId + ".date"]: serverTimestamp(),
            }),
          ]);

          setText("");
          setAttachment(null);
          setAttachmentPreview(null);
          setIsUploading(false);
        });
      } else {
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text: text.trim(),
            senderId: currentUser.uid,
            date: Timestamp.now(),
          }),
        });

        await Promise.all([
          updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: { text: text.trim() },
            [data.chatId + ".date"]: serverTimestamp(),
          }),
          updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]: { text: text.trim() },
            [data.chatId + ".date"]: serverTimestamp(),
          }),
        ]);

        setText("");
        setAttachment(null);
        setAttachmentPreview(null);
        setIsUploading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100 flex items-center gap-2 sm:gap-3 relative w-full">
      {attachmentPreview && (
        <div
          className="absolute bottom-16 left-4 w-28 sm:w-32 bg-white rounded-xl shadow-md cursor-pointer z-20 flex flex-col items-center overflow-hidden"
          onClick={() => {
            setAttachment(null);
            setAttachmentPreview(null);
          }}
        >
          <img
            src={attachmentPreview}
            alt="preview"
            className="w-full h-auto"
          />
          <MdDeleteForever className="text-red-500 my-2" size={20} />
        </div>
      )}

      <Input
        type="file"
        id="file"
        style={{ display: "none" }}
        onChange={onFileChange}
        disabled={!isChatSelected}
      />
      <label
        htmlFor="file"
        className="cursor-pointer text-gray-400 hover:text-gray-300 transition-colors"
      >
        <RiImageAddFill size={24} />
      </label>

      <div className="flex-1 relative">
        <Input
          placeholder={
            isChatSelected
              ? "Type a message..."
              : "Select a chat to start messaging..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isChatSelected}
          className="w-full rounded-full px-4 py-2 text-sm sm:text-base bg-white focus:ring-2 focus:ring-blue-400 shadow-sm"
        />
        <div className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 ">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-200 transition-all duration-150"
              disabled={!isChatSelected}
              onClick={() => setEmoji((prev) => !prev)}
            >
              <BsEmojiSmile size={22} className="text-gray-500" />
            </Button>

            {emoji && (
              <ClickAwayListener onClickAway={() => setEmoji(false)}>
                <div className="absolute bottom-4 mb-2 right-[90px] w-72 z-50">
                  {/* Add padding inside */}
                  <div className="p-2">
                    <EmojiPicker
                      emojiStyle="google"
                      autoFocus={false}
                      theme="light"
                      onEmojiClick={onEmojiClick}
                    />
                  </div>
                </div>
              </ClickAwayListener>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <Button
          onClick={handleSend}
          disabled={
            !isChatSelected || (!text.trim() && !attachment) || isUploading
          }
          className="rounded-full w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          size="icon"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoSend size={18} className="ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatFooter;
