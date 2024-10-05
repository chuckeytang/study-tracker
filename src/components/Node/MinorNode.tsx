import { handlerRadius } from "@/types/Values";
import React from "react";
import { Handle, HandleType, Position } from "reactflow";

interface MinorNodeProps {
  data: any;
  radius: number;
  onContextMenu: (event: React.MouseEvent, nodeData: any) => void;
}

const MinorNode: React.FC<MinorNodeProps> = ({
  data,
  radius,
  onContextMenu,
}) => {
  const { nodeName, handles, maxLevel, nodeId, nodeDescription } = data;
  return (
    <div
      onContextMenu={(event) => onContextMenu(event, data)}
      className={`flex items-center justify-center bg-sky-950 rounded-full text-white font-semibold`}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        transform: "translate(-50%, -50%)", // 调整节点使其中心与 position 对齐
      }}
    >
      <div
        className="bg-stone-50 rounded-full"
        style={{
          width: `${radius * 1.8}px`,
          height: `${radius * 1.8}px`,
        }}
      ></div>
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
                top: `${handle.position.y + radius}px`,
                left: `${handle.position.x + radius}px`,
                position: "absolute",
                transform: "translate(-50%, -50%)", // 确保句柄中心点对齐
                width: `${handlerRadius * 2}px`, // 统一的句柄宽度
                height: `${handlerRadius * 2}px`, // 统一的句柄高度
                borderRadius: "50%", // 确保句柄是圆形
              }}
              id={handle.id}
            />
          )
        )}

      <div className="fixed bottom-0 right-0 text-[8px] bg-amber-900 rounded-md text-center text-white items-end p-[2px]">
        <div>{nodeName}</div>
        <div>maxlevel:{maxLevel}</div>
      </div>
    </div>
  );
};

export default MinorNode;
