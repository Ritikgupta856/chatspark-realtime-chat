import React from 'react';
import { ClipLoader } from "react-spinners";
import "./Loader.css"


const Loader = () => {
  return (
    <div className='loader'>
      <ClipLoader
        size={50}
        color="#9d97ab"
      />
    </div>
  )
}

export default Loader;
