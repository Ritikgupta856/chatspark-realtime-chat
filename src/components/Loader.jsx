import React from "react";
import { ClipLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <ClipLoader size={50} color="#9d97ab" />
    </div>
  );
};

export default Loader;
