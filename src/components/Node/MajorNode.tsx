import React from "react";
import { Handle, Position } from "reactflow";

interface MajorNodeProps {
  name: string;
}

const MajorNode: React.FC<MajorNodeProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full text-white font-semibold">
      {name}

      {/* 添加句柄 */}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default MajorNode;
