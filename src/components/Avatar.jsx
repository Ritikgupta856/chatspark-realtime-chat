import React from "react";

function Avatar({ size, onClick, user }) {
  let avatarSize;
  let avatarTextSize;

  if (size === "small") {
    avatarSize = "32px";
  } else if (size === "medium") {
    avatarSize = "36px";
  } else if (size === "large") {
    avatarSize = "45px";
  } else if (size === "x-large") {
    avatarSize = "65px";
    avatarTextSize = "2rem";
  } else if (size === "xx-large") {
    avatarSize = "96px";
    avatarTextSize = "4rem";
  }
  let sizeClass = "";
  let textSizeClass = "";
  if (size === "small") {
    sizeClass = "w-8 h-8";
    textSizeClass = "text-base";
  } else if (size === "medium") {
    sizeClass = "w-9 h-9";
    textSizeClass = "text-lg";
  } else if (size === "large") {
    sizeClass = "w-11 h-11";
    textSizeClass = "text-xl";
  } else if (size === "x-large") {
    sizeClass = "w-16 h-16";
    textSizeClass = "text-2xl";
  } else if (size === "xx-large") {
    sizeClass = "w-24 h-24";
    textSizeClass = "text-4xl";
  }

  return (
    <div className={`relative inline-block ${sizeClass}`} onClick={onClick}>
      {user?.isOnline && size === "large" && (
        <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></span>
      )}
      {user?.photoURL ? (
        <img
          className={`object-cover rounded-full ${sizeClass}`}
          src={user?.photoURL}
          alt=""
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full uppercase text-white ${sizeClass} ${textSizeClass}`}
          style={{ backgroundColor: user?.color || "#888" }}
        >
          {user?.displayName?.charAt(0)}
        </div>
      )}
    </div>
  );
}

export default Avatar;
