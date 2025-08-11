import { useChatContext } from "../context/ChatContext";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import Search from "./Search";
import React, { useContext, useState } from "react";

import { auth, db, storage } from "@/firebase";
import { AuthContext } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import { IoLogOutOutline, IoClose } from "react-icons/io5";

import { MdPhotoCamera, MdAddAPhoto, MdDeleteForever } from "react-icons/md";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import Avatar from "./Avatar";
import { BiEdit } from "react-icons/bi";
import { BiCheck } from "react-icons/bi";
import { BsFillCheckCircleFill } from "react-icons/bs";

import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import toast from "react-hot-toast";

const profileColors = [
  "#8C1AAE", // Deep purple
  "#00BFFF", // Bright blue
  "#FF6B6B", // Vibrant red
  "#FFA500", // Orange
  "#00C853", // Bright green
  "#9575CD", // Light purple
  "#FF9100", // Amber
  "#00B8D4", // Teal
  "#F48FB1", // Pink
  "#7CB342", // Light green
  "#E91E63", // Magenta
  "#0D47A1", // Navy blue
  "#FFD600", // Yellow
  "#4CAF50", // Green
  "#673AB7", // Deep purple
];

function LeftNav() {
  const { currentUser, signOut, setCurrentUser } = useContext(AuthContext);
  const [editProfile, setEditProfile] = useState(false);
  const [nameEdited, setNameEdited] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { users } = useChatContext();
  const authUser = auth.currentUser;

  const uploadImageToFirestore = (file) => {
    try {
      if (file) {
        const storageRef = ref(storage, currentUser.displayName);

        const uploadTask = uploadBytesResumable(storageRef, file);

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
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                console.log("File available at", downloadURL);
                handleUpdateProfile("photo", downloadURL);
                await updateProfile(authUser, {
                  photoURL: downloadURL,
                });
              }
            );
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async (type, value) => {
    let obj = { ...currentUser };
    switch (type) {
      case "color":
        obj.color = value;
        break;
      case "name":
        obj.displayName = value;
        break;
      case "photo":
        obj.photoURL = value;
        break;
      case "photo-remove":
        obj.photoURL = null;
        break;
      default:
        break;
    }

    try {
      const userDocRef = doc(db, "users", currentUser?.uid);
      await updateDoc(userDocRef, obj);
      setCurrentUser(obj);

      if (type === "photo-remove") {
        await updateProfile(authUser, { photoURL: null });
      } else if (type === "name") {
        await updateProfile(authUser, { displayName: value });
        setNameEdited(false);
      } else if (type === "photo") {
        await updateProfile(authUser, { photoURL: value });
      }
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Profile update failed");
    }
  };

  const onkeyup = (event) => {
    if (event.target.innerText.trim() !== currentUser?.displayName) {
      setNameEdited(true);
    } else {
      setNameEdited(false);
    }
  };
  const onkeydown = (event) => {
    if (event.key === "Enter" && event.keyCode === 13) {
      event.preventDefault();
    }
  };

  return (
    <div
      className={`flex flex-col relative cursor-pointer bg-white ${
        editProfile ? "w-[300px]" : "w-[60px]"
      } transition-all duration-300`}
    >
      {editProfile && (
        <div className="absolute top-1 right-1 flex">
          <IoClose onClick={() => setEditProfile(false)} size={20} />
        </div>
      )}
      <div className="mx-auto mt-2 rounded-full relative group">
        {editProfile ? (
          <Avatar
            size="x-large"
            onClick={() => setEditProfile(true)}
            user={currentUser}
          />
        ) : (
          <Avatar
            size="large"
            onClick={() => setEditProfile(true)}
            user={currentUser}
          />
        )}
        {editProfile && (
          <div className="absolute inset-0 bg-black/70 rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <label
              htmlFor="fileUpload"
              className="flex justify-center items-center cursor-pointer"
            >
              <span className="text-white">
                {currentUser?.photoURL ? (
                  <MdPhotoCamera size={25} />
                ) : (
                  <MdAddAPhoto size={25} />
                )}
              </span>
            </label>
            <input
              id="fileUpload"
              type="file"
              className="hidden"
              onChange={(e) => uploadImageToFirestore(e.target.files[0])}
            />
          </div>
        )}
      </div>
      {editProfile && currentUser?.photoURL && (
        <div>
          <MdDeleteForever
            className="w-6 h-6 bg-red-500 rounded-full absolute top-14 right-28 text-white p-1 cursor-pointer"
            onClick={() => handleUpdateProfile("photo-remove")}
          />
        </div>
      )}
      {editProfile && (
        <div className="flex flex-col mt-1 items-center">
          <div className="flex items-center justify-center gap-1">
            {!nameEdited && <BiEdit />}
            {nameEdited && (
              <BsFillCheckCircleFill
                onClick={() =>
                  handleUpdateProfile(
                    "name",
                    document.getElementById("displayNameEdit").innerText
                  )
                }
              />
            )}
            <span
              className="capitalize border-none outline-none bg-transparent text-center"
              contentEditable
              onKeyUp={onkeyup}
              onKeyDown={onkeydown}
              id="displayNameEdit"
            >
              {currentUser?.displayName}
            </span>
          </div>
          <span className="flex justify-center text-gray-500 text-sm">
            {currentUser?.email}
          </span>
        </div>
      )}
      {editProfile && (
        <div className="grid grid-cols-5 gap-x-4 gap-y-2 my-4 mx-auto">
          {profileColors.map((color, index) => (
            <span
              key={index}
              style={{ backgroundColor: color }}
              className="rounded-full flex justify-center items-center w-6 h-6 cursor-pointer hover:scale-125 transition-transform"
              onClick={() => handleUpdateProfile("color", color)}
            >
              {color === currentUser?.color ? (
                <BiCheck color="white" size={24} />
              ) : null}
            </span>
          ))}
        </div>
      )}
      <div
        className={`flex ${
          editProfile
            ? "flex-row absolute bottom-1 left-2"
            : "flex-col mt-auto mb-5"
        } gap-2 items-center self-center`}
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <FiPlus
              className="bg-green-500 rounded-full cursor-pointer text-white text-2xl p-1 hover:bg-gray-700 transition"
              size={24}
              onClick={() => setDialogOpen(true)}
            />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>
                Search and add a user to chat with.
              </DialogDescription>
            </DialogHeader>
            <Search />
            <div className="mt-1 flex flex-col max-h-80 overflow-auto">
              {users &&
                Object.values(users).map((user) => {
                  if (user.uid === currentUser.uid) {
                    return null;
                  }
                  return (
                    <div
                      key={user.uid}
                      className="flex items-center gap-2 rounded-2xl p-2 cursor-pointer hover:bg-gray-100"
                      onClick={async () => {
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
                          setDialogOpen(false);
                        } catch (error) {
                          console.error(error);
                        } finally {
                          toast.success("User added successfully");
                        }
                      }}
                    >
                      <div>
                        <Avatar size="large" user={user} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-base capitalize">{user?.displayName}</span>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 bg-gray-900 text-white rounded">
                  Close
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="cursor-pointer text-black p-2 hover:bg-gray-400 hover:rounded-full transition">
          <IoLogOutOutline size={24} onClick={signOut} />
        </div>
      </div>
    </div>
  );
}

export default LeftNav;
