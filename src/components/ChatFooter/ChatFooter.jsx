import React, { useContext, useState } from "react";

import { AuthContext } from "../../context/AuthContext";
import { ChatContext, useChatContext } from "../../context/ChatContext";

import { BsEmojiSmile } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import { RiImageAddFill } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import "./ChatFooter.css";

import {
  arrayUnion,
  deleteField,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import ClickAwayListener from "react-click-away-listener";

const ChatFooter = () => {
  const {
    text,
    setText,
    setAttachment,
    setAttachmentPreview,
    attachmentPreview,
    attachment,
  } = useChatContext();

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const [emoji, setEmoji] = useState(false);

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSend();
    }
  };



  const onEmojiClick = (emojiData) => {
    const { emoji } = emojiData;
    setText((prevText) => prevText + emoji);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);

    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setAttachmentPreview(blobUrl);
    }
  };

  const handleSend = async () => {
    try {
      if (attachment) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, attachment);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
            }
          },
          (error) => {
            console.error(error);
          },
          async () => {
            try {
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
              await updateDoc(doc(db, "userChats", currentUser.uid), {
                [data.chatId + ".lastMessage"]: lastMessage,
                [data.chatId + ".date"]: serverTimestamp(),
              });
              await updateDoc(doc(db, "userChats", data.user.uid), {
                [data.chatId + ".lastMessage"]: lastMessage,
                [data.chatId + ".date"]: serverTimestamp(),
              });
            } catch (error) {
              console.error(error);
            }
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

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [data.chatId + ".lastMessage"]: {
            text,
          },
          [data.chatId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
          [data.chatId + ".lastMessage"]: {
            text,
          },
          [data.chatId + ".date"]: serverTimestamp(),
          [data.chatId + ".chatDeleted"]: deleteField(),
        });
      }


      setText("");
      setAttachment(null);
      setAttachmentPreview(null);
    
    } catch (error) {
      console.log(error);
    }
  };


  


  return (
    <div className="ChatFooter">
      <div className="chatFooter-items">
        {attachmentPreview && (
          <div
            className="attachment-preview"
            onClick={() => {
              setAttachment(null);
              setAttachmentPreview(null);
            }}
          >
            <img src={attachmentPreview} alt="" />
            <MdDeleteForever className="delete-image-preview" size={14} />
          </div>
        )}

        <input
          type="file"
          style={{ display: "none" }}
          onChange={onFileChange}
          id="file"
        />

        <label htmlFor="file">
          <div className="attachment">
            <RiImageAddFill />
          </div>
        </label>

  
        <input
          type="text"
          placeholder="Write something here..."
          value={text}
          onKeyDown={handleKeyDown}
          onChange={(e) => setText(e.target.value)}
        />

        {emoji && (
          <ClickAwayListener onClickAway={() => setEmoji(false)}>
            <div className="emoji-picker">
              <EmojiPicker
                emojiStyle="google"
                autoFocus={false}
                theme="light"
                onEmojiClick={onEmojiClick}
              />
            </div>
          </ClickAwayListener>
        )}

        <div className="emoji-send-container">
          <div className="emoji-btn">
            <BsEmojiSmile onClick={() => setEmoji(true)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFooter;
