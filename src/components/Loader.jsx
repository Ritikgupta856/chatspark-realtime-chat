import { Loader2 } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
      <Loader2 size={50} color="#9d97ab" className="animate-spin" />
    </div>
  );
};

export default Loader;