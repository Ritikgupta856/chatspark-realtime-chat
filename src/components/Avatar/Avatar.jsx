import React from 'react';
import './Avatar.css';

function Avatar({ size, onClick, user }) {

  let avatarSize;
  let avatarTextSize;

  if (size === 'small') {
    avatarSize = '32px';
  } else if (size === 'medium') {
    avatarSize = '36px';
  } else if (size === 'large') {
    avatarSize = '45px';
  } else if (size === 'x-large') {
    avatarSize = '65px';
    avatarTextSize = '2rem';
  } else if (size === 'xx-large') {
    avatarSize = '96px';
    avatarTextSize = '4rem';
  }



  const avatarStyle = {
    "--avatar-size": avatarSize,
    "--avatar-text-size": avatarTextSize,
    "--avatar-background-color": user?.color || "",
  };

  

  return (
    <div className="avatar" onClick={onClick} >
      {user?.isOnline && (<>
        {(size === "large") && <span className='status'></span>}
      </>)}
   
      {user?.photoURL ? (
        <img
          className="avatar-image"
          src={user?.photoURL}
          alt=""
          style={avatarStyle}
        />
      ) : (
        <div className="avatar-text" style={avatarStyle}>
          {user?.displayName?.charAt(0)}
        </div>
      )}



    </div>

  );
};

export default Avatar;
