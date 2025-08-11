import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext, useChatContext } from "../context/ChatContext";
import { BsEmojiSmile } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import { RiImageAddFill } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  deleteField,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import ClickAwayListener from "react-click-away-listener";

// shadcn/ui components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ChatFooter = () => {
  const { text, setText, setAttachment, setAttachmentPreview, attachmentPreview, attachment } = useChatContext();
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const [emoji, setEmoji] = useState(false);

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) handleSend();
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
    try {
      if (attachment) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, attachment);

        uploadTask.on(
          "state_changed",
          null,
          console.error,
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                read: false,
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
          }
        );
      } else {
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            read: false,
          }),
        });
        await Promise.all([
          updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: { text },
            [data.chatId + ".date"]: serverTimestamp(),
          }),
          updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]: { text },
            [data.chatId + ".date"]: serverTimestamp(),
            [data.chatId + ".chatDeleted"]: deleteField(),
          }),
        ]);
      }

      setText("");
      setAttachment(null);
      setAttachmentPreview(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-[#f4f3f8] p-3 border-t flex items-center gap-2">
      {attachmentPreview && (
        <div
          className="absolute bottom-16 w-32 bg-white rounded-lg shadow-md cursor-pointer z-10 flex flex-col items-center overflow-hidden"
          onClick={() => {
            setAttachment(null);
            setAttachmentPreview(null);
          }}
        >
          <img src={attachmentPreview} alt="" className="w-full h-auto" />
          <MdDeleteForever className="text-red-500 my-2" size={18} />
        </div>
      )}

      <input
        type="file"
        id="file"
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <label htmlFor="file" className="cursor-pointer text-blue-500 hover:text-blue-600">
        <RiImageAddFill size={24} />
      </label>

      <Input
        placeholder="Write something here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 rounded-full px-4"
      />

      <Popover open={emoji} onOpenChange={setEmoji}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <BsEmojiSmile size={20} className="text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="p-0 border-none shadow-none">
          <ClickAwayListener onClickAway={() => setEmoji(false)}>
            <div>
              <EmojiPicker
                emojiStyle="google"
                autoFocus={false}
                theme="light"
                onEmojiClick={onEmojiClick}
              />
            </div>
          </ClickAwayListener>
        </PopoverContent>
      </Popover>

      <Button onClick={handleSend} className="rounded-full px-6">
        Send
      </Button>
    </div>
  );
};

export default ChatFooter;
