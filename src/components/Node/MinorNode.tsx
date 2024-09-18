import React from "react";

interface MinorNodeProps {
  name: string;
}

const MinorNode: React.FC<MinorNodeProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full text-white font-semibold">
      {name}
    </div>
  );
};

export default MinorNode;
