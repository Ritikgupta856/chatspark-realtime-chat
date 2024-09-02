import { createContext, useEffect, useState } from "react";
import React from 'react';
import { auth, db } from "../firebase";
import { onAuthStateChanged,signOut as authSignOut  } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";


export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isloading, setIsloading] = useState(true);
  
  const clear = async () => {
    try {

         if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          isOnline: false,
        });
      }
  

      setCurrentUser(null);
      setIsloading(false);
  
   
  
    } catch (error) {
      console.error(error);
    }
  };
  const authStateChanged = async (user) => {
    setIsloading(true);
    if(!user){
       clear();
       return;
    }


    const userDocExist = await getDoc(doc(db,"users" ,user.uid));
    if(userDocExist.exists()){
      await updateDoc(doc(db,"users",user.uid),{
        isOnline:true,
      });
    }

    const userDoc = await getDoc(doc(db,"users",user.uid));
    setCurrentUser(userDoc.data());
    setIsloading(false);
  };

  const signOut = () =>{
    authSignOut(auth).then(()=>clear());
  }


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, authStateChanged)
     return () => unsub();
  
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isloading,
        setIsloading,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};