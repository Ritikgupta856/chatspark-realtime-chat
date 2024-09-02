import React, { useContext } from "react";
import Avatar from "../Avatar/Avatar";
import PopupWrapper from "../PopupWrapper/PopupWrapper";

import "./UserPopup.css";
import { useChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "../../firebase";
import Search from "../Search/Search";
import toast from "react-hot-toast";

function UserPopup(props) {
  const { currentUser } = useContext(AuthContext);
  const { users } = useChatContext();

  const handleSelect = async (user) => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
            color: user.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || null,
            color: currentUser.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".chatDeleted"]: deleteField(),
        });
      }
      props.onHide();
    } catch (error) {
      console.error(error);
    } finally {
      toast.success("User added successfully");
    }
  };

  return (
    <PopupWrapper {...props}>
      <Search className="search-users" />
      <div className="user-popup">
        {users &&
          Object.values(users).map((user) => {
            if (user.uid === currentUser.uid) {
              return null;
            }
            return (
              <div className="user-item" onClick={() => handleSelect(user)}>
                <div className="user-photo">
                  <Avatar size="large" user={user} />
                </div>
                <div className="user-details">
                  <span className="display-name">{user?.displayName}</span>
                  <p className="email">{user?.email}</p>
                </div>
              </div>
            );
          })}
      </div>
    </PopupWrapper>
  );
}

export default UserPopup;
