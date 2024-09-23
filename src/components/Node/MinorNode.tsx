import React from "react";
import { Handle, Position } from "reactflow";

interface MinorNodeProps {
  data: any;
}

const MinorNode: React.FC<MinorNodeProps> = ({ data }) => {
  const { name, sourceHandlePosition, targetHandlePosition } = data;
  return (
    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full text-white font-semibold">
      {name}

      {/* 添加句柄 */}
      <Handle type="source" position={sourceHandlePosition} />
      <Handle type="target" position={targetHandlePosition} />
    </div>
  );
};

export default MinorNode;
