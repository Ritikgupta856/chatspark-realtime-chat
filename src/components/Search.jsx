import React, { useContext, useState } from "react";


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
import { db } from "@/firebase"
import { AuthContext } from "../context/AuthContext";
import { RiSearch2Line } from 'react-icons/ri';
import Avatar from "./Avatar";


const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);


  const { currentUser } = useContext(AuthContext);

  const handleKey = async (e) => {
    if (e.code === "Enter" && !!username) {
      try {
        setErr(false)
        const q = query(
          collection(db, "users"),
          where("displayName", "==", username))

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setErr(true);
          setUser(null);
        }
        else {
          querySnapshot.forEach((doc) => {
            setUser(doc.data());
          });
        }

      }
      catch (error) {
        console.error(error);
        setErr(error);
      }
    }
  };

  const handleSelect = async () => {
    const combinedId =
    currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user?.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL || null,
            color: user?.color
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser?.uid,
            displayName: currentUser?.displayName,
            photoURL: currentUser?.photoURL || null,
            color: currentUser?.color
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }

      else {
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".chatDeleted"]: deleteField(),
        })

      }
      setUser(null);
      setUsername("");

    } catch (err) {
      setErr(true);
    }

  };



  return (
    <div className="flex-shrink-0 mt-5">
      <div className='relative'>
        <RiSearch2Line className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder='Search user'
          onKeyUp={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          value={username}
          className="w-[95%] h-6 rounded-xl outline-none bg-[#f4f3f9] border-none p-1 pl-7 text-base"
        />
        <span className="absolute right-2 bottom-2 text-xs text-gray-400">Enter</span>
      </div>

      {err && <div className="text-red-500 text-sm mt-2">User not found!</div>}

      {user &&
        <div className="flex items-center gap-2 rounded-2xl p-2 cursor-pointer hover:bg-gray-100 mt-2" onClick={() => handleSelect(user)}>
          <div>
            <Avatar size="large" user={user} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-base capitalize">{user.displayName}</span>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      }
    </div>
  );

}



export default Search
