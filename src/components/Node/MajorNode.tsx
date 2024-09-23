import React from "react";
import { Handle, Position } from "reactflow";

interface MajorNodeProps {
  data: any;
}

const MajorNode: React.FC<MajorNodeProps> = ({ data }) => {
  const { name, sourceHandlePosition, targetHandlePosition } = data;
  return (
    <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full text-white font-semibold">
      {name}

      {/* 添加句柄 */}
      <Handle type="source" position={sourceHandlePosition} />
      <Handle type="target" position={targetHandlePosition} />
    </div>
  );
};

export default MajorNode;
