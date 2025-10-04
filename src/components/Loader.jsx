import { Loader2 } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="h-screen flex justify-center items-center animate-spin">
      <Loader2 size={50} color="#9d97ab" />
    </div>
  );
};

export default Loader;
