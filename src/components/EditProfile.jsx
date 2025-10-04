import React, { useState, useContext } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Camera, Save } from "lucide-react";
import { toast } from "react-hot-toast"; // or your toast library
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "firebase/storage";
import { 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { storage, db, auth } from "@/firebase";
import { AuthContext } from "@/context/AuthContext";
import { ChatContext } from "@/context/ChatContext";

const EditProfile = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [nameEdited, setNameEdited] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [avatar, setAvatar] = useState(currentUser?.photoURL || "");
  const { users } = useContext(ChatContext);
  const authUser = auth.currentUser;

  const uploadImageToFirestore = (file) => {
    try {
      if (file) {
        const storageRef = ref(storage, `avatars/${currentUser.uid}/${file.name}`);

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
                break;
            }
          },
          (error) => {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                console.log("File available at", downloadURL);
                setAvatar(downloadURL);
                handleUpdateProfile("photo", downloadURL);
                await updateProfile(authUser, {
                  photoURL: downloadURL,
                });
                toast.success("Avatar updated successfully");
              }
            );
          }
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
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
        setAvatar(null);
      } else if (type === "name") {
        await updateProfile(authUser, { displayName: value });
        setNameEdited(false);
      } else if (type === "photo") {
        await updateProfile(authUser, { photoURL: value });
      }
      
      if (type !== "photo") { // Don't show twice for photo uploads
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Profile update failed");
    }
  };

  const handleAvatarChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadImageToFirestore(file);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    try {
      // Update name if changed
      if (name !== currentUser?.displayName) {
        await handleUpdateProfile("name", name);
      }

      // Update email if changed (note: this requires re-authentication in Firebase)
      if (email !== currentUser?.email) {
        // Email update requires special handling in Firebase Auth
        console.log("Email update requires re-authentication");
        toast.info("Email update requires re-authentication");
      }

      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    }
  };

  const onKeyUp = (event) => {
    if (event.target.value.trim() !== currentUser?.displayName) {
      setNameEdited(true);
    } else {
      setNameEdited(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && event.keyCode === 13) {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
                <AvatarFallback className="text-lg">
                  {name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={handleAvatarChange}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={handleAvatarChange}>
              Change Avatar
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;