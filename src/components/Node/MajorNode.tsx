import { handlerRadius } from "@/types/Values";
import React from "react";
import { Handle, HandleType, Position } from "reactflow";

interface MajorNodeProps {
  data: any;
  radius: number;
  selected?: boolean;
  userRole: "teacher" | "student" | "otherStudent";
  onContextMenu: (event: React.MouseEvent, nodeData: any) => void;
  handleLevelChange?: (nodeId: string, delta: number) => void;
}

const MajorNode: React.FC<MajorNodeProps> = ({
  data,
  radius,
  selected,
  userRole = "teacher",
  onContextMenu,
  handleLevelChange,
}) => {
  const { nodeName, handles, maxLevel, nodeId, nodeDescription } = data;

  let bgColor = "bg-gray-700"; // 默认锁定状态灰色
  let imgFilter = "grayscale(100%)"; // 默认图片置灰
  let opacity = 0.5;

  // 根据不同状态设置颜色和透明度
  if (data.unlocked) {
    bgColor = "bg-yellow-700"; // 解锁状态
    imgFilter = "none"; // 解锁后取消置灰
    opacity = 1;
    if (data.level === data.maxLevel) {
      bgColor = "bg-green-700"; // 满级状态绿色
    }
  }

  if (selected) {
    bgColor = "bg-blue-700"; // 选中状态蓝色
  }

  const handleIncrement = () => {
    handleLevelChange && handleLevelChange(data.nodeId, +1);
  };

  const handleDecrement = () => {
    handleLevelChange && handleLevelChange(data.nodeId, -1);
  };

  return (
    <div
      onContextMenu={(event) => onContextMenu(event, data)}
      className={`flex items-center justify-center ${bgColor} rounded-full text-white font-semibold`}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        transform: "translate(-50%, -50%)", // 调整节点使其中心与 position 对齐
        opacity: opacity,
      }}
    >
      <div className="rounded-full bg-white w-11/12 h-11/12 overflow-hidden">
        <img
          src={data.picUrl}
          alt="big check"
          className="w-full h-full object-cover rounded-full"
          style={{
            filter: imgFilter, // 根据状态设置图片灰度
          }}
        />
      </div>

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
      <div className="fixed bottom-2 -right-4 text-[12px] bg-gray-900 rounded-t-lg text-end border-3 border-green-900 rtext-white items-end p-1 pr-2 w-1/2">
        <div>{nodeName}</div>
        {userRole === "teacher" && <div>maxlevel:{maxLevel}</div>}
      </div>

      {userRole === "student" && (
        <div className="fixed -bottom-6 -right-4 w-1/2 h-8 bg-gray-900 rounded-b-lg flex p-1 space-x-1 items-center justify-center">
          <button
            className="w-6 h-6 rounded-md bg-lime-500 font-extrabold"
            onClick={handleDecrement}
          >
            -
          </button>
          <span>
            {data.level}/{data.maxLevel}
          </span>
          <button
            className="w-6 h-6 rounded-md bg-lime-500 font-extrabold"
            onClick={handleIncrement}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default MajorNode;
