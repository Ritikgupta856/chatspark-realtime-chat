import React, { useContext, useState } from "react";
import "./Search.css";

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
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { RiSearch2Line } from 'react-icons/ri';
import Avatar from "../Avatar/Avatar";


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
    <div className="search-wrapper">
      <div className='search-container'>
        <RiSearch2Line className="search-icon" />
        <input
          type="text"
          placeholder='Search user'
          onKeyUp={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          value={username}
        />

        <span className="enter">Enter</span>

      </div>

      {err && <div className="user-not-found-error">

        User not found!
        <div className="partition" ></div>

      </div>
      }


{user &&
      <div className="user-item"  onClick={() => handleSelect(user)}>
        <div className="user-photo">
          <Avatar size="large" user={user} />
        </div>
        <div class="user-details">
          <span class="display-name" >{user.displayName}</span>
          <p class="email">{user.email}</p>
          
        </div>
        <div className="partition"></div>
      </div>

      }

    </div>


  );

}



export default Search
