import React from "react";
import { Handle, Position } from "reactflow";

interface MinorNodeProps {
  name: string;
}

const MinorNode: React.FC<MinorNodeProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full text-white font-semibold">
      {name}

      {/* 添加句柄 */}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default MinorNode;
