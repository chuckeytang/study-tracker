import React from "react";
import { Handle, HandleType, Position } from "reactflow";

interface MajorNodeProps {
  data: any;
  radius: number;
}

const MajorNode: React.FC<MajorNodeProps> = ({ data, radius }) => {
  const { name, handles } = data;
  return (
    <div
      className={`flex items-center justify-center bg-red-500 rounded-full text-white font-semibold`}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
      }}
    >
      {name}

      {/* 添加句柄 */}
      {handles &&
        handles.map(
          (
            handle: {
              type: HandleType;
              position: { x: number; y: number };
              id: string;
            },
            index: number
          ) => (
            <Handle
              key={index}
              type={handle.type} // source 或 target
              position={Position.Left} // 必需的属性，虽然由 style 控制位置
              style={{
                top: `${handle.position.y}px`,
                left: `${handle.position.x}px`,
                position: "relative",
              }}
              id={handle.id}
            />
          )
        )}
    </div>
  );
};

export default MajorNode;
