import React, { useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "@/firebase";
import { AuthContext } from "../context/AuthContext";
import { RiSearch2Line } from "react-icons/ri";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!username.trim()) {
      setUser(null);
      setErr(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setErr(false);
        const q = query(
          collection(db, "users"),
          where("displayName", ">=", username),
          where("displayName", "<=", username + "\uf8ff")
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setErr(true);
          setUser(null);
        } else {
          querySnapshot.forEach((doc) => {
            if (doc.id !== currentUser.uid) {
              setUser(doc.data());
            }
          });
        }
      } catch (error) {
        console.error(error);
        setErr(true);
      }
    }, 300); 

    return () => clearTimeout(delayDebounce);
  }, [username, currentUser.uid]);

  const handleSelect = async () => {
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
            uid: user?.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL || null,
            color: user?.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser?.uid,
            displayName: currentUser?.displayName,
            photoURL: currentUser?.photoURL || null,
            color: currentUser?.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".chatDeleted"]: deleteField(),
        });
      }
      setUser(null);
      setUsername("");
    } catch (err) {
      setErr(true);
    }
  };

  return (
    <div className="flex-shrink-0 mt-5">
      <div className="relative">
        <RiSearch2Line className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <Input
          type="text"
          placeholder="Search user"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>

      {err && <div className="text-red-500 text-sm mt-2">User not found!</div>}

      {user && (
        <div
          className="flex items-center gap-2 rounded-2xl p-2 cursor-pointer hover:bg-gray-100 mt-2"
          onClick={() => handleSelect(user)}
        >
          <div>
            <Avatar>
              <AvatarImage src={user?.photoURL} alt="avatar" />
              <AvatarFallback
                className="text-white"
                style={{ backgroundColor: user?.color }}
              >
                {user?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-base capitalize">{user.displayName}</span>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
