import { createContext, useEffect, useState } from "react";
import React from "react";
import { onAuthStateChanged, signOut as authSignOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isloading, setIsloading] = useState(true);

  const clear = async () => {
    try {
      if (currentUser?.uid) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          await updateDoc(userDocRef, {
            isOnline: false,
          });
        }
      }
    } catch (error) {
      console.error("Error in clear function:", error);
    } finally {
      setCurrentUser(null);
      setIsloading(false);
    }
  };

  const authStateChanged = async (user) => {
    setIsloading(true);

    if (!user) {
      await clear();
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Update online status
        await updateDoc(userDocRef, {
          isOnline: true,
        });

        // Get updated user data
        const userData = userDocSnap.data();
        setCurrentUser(userData);
      } else {
        // User document doesn't exist yet (might be during registration)
        console.warn("User document not found for uid:", user.uid);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error in authStateChanged:", error);
      setCurrentUser(null);
    } finally {
      setIsloading(false);
    }
  };

  const signOut = async () => {
    try {
      await clear();
      await authSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, authStateChanged);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
