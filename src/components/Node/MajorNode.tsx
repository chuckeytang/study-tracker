import React from "react";

interface MajorNodeProps {
  name: string;
}

const MajorNode: React.FC<MajorNodeProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full text-white font-semibold">
      {name}
    </div>
  );
};

export default MajorNode;
