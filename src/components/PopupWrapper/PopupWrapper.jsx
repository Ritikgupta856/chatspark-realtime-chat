import React from 'react';
import './PopupWrapper.css';
import { IoClose } from 'react-icons/io5';

function PopupWrapper(props) {
  return (
    <div className='popup-wrapper'>
<div className={`popup-container ${props.shortHeight ? "for-delete" : ""}` } >

    {!props.noheader && <div>
        <IoClose className='close-icon' size={20} onClick={props.onHide}  />
          
          <h2>{props.title}</h2>
          </div>
      }
        
        <div className="users-container">
          {props.children}
        </div>
      </div>
      </div>


  )
}

export default PopupWrapper;
