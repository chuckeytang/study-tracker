import { handlerRadius } from "@/types/Values";
import React from "react";
import { Handle, HandleType, Position } from "reactflow";

interface MinorNodeProps {
  data: any;
  radius: number;
  userRole: "teacher" | "student" | "otherStudent";
  onContextMenu: (event: React.MouseEvent, nodeData: any) => void;
  handleLevelChange?: (nodeId: string, delta: number) => void;
}

const MinorNode: React.FC<MinorNodeProps> = ({
  data,
  radius,
  userRole = "teacher",
  onContextMenu,
  handleLevelChange,
}) => {
  const { nodeName, handles, maxLevel, nodeId } = data;

  // 状态颜色和图片滤镜初始化
  let bgColor = "bg-gray-700"; // 默认锁定状态灰色
  let imgFilter = "grayscale(100%)"; // 默认图片置灰
  let opacity = 0.5; // 默认透明度50%用于锁定状态

  // 如果节点解锁
  if (data.unlocked) {
    bgColor = "bg-yellow-700"; // 解锁状态黄色
    imgFilter = "none"; // 取消图片置灰
    opacity = 1; // 透明度恢复正常

    // 如果达到最大等级
    if (data.level === maxLevel) {
      bgColor = "bg-green-700"; // 满级状态绿色
    }
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
      className={`flex items-center justify-center rounded-full text-white font-semibold ${bgColor}`}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        transform: "translate(-50%, -50%)",
        opacity: opacity, // 根据状态调整透明度
      }}
    >
      <div className="rounded-full bg-white w-11/12 h-11/12 overflow-hidden">
        <img
          src={data.picUrl}
          alt="minor node"
          className="w-full h-full object-cover rounded-full"
          style={{ filter: imgFilter }} // 根据状态调整图片灰度
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
              type={handle.type}
              position={Position.Left}
              style={{
                top: `${handle.position.y + radius}px`,
                left: `${handle.position.x + radius}px`,
                position: "absolute",
                transform: "translate(-50%, -50%)",
                width: `${handlerRadius * 2}px`,
                height: `${handlerRadius * 2}px`,
                borderRadius: "50%",
              }}
              id={handle.id}
            />
          )
        )}

      {/* 节点信息显示 */}
      <div className="fixed bottom-4 -right-4 text-[8px] bg-gray-900 rounded-t-lg text-end border-3 border-green-900 rtext-white items-end p-1 w-3/5">
        <div>{nodeName}</div>
        {userRole === "teacher" && <div>maxlevel:{maxLevel}</div>}
      </div>

      {/* 学生的等级调整面板 */}
      {userRole === "student" && (
        <div className="fixed -bottom-4 -right-4 w-3/5 h-8 bg-gray-900 rounded-b-lg flex p-1 space-x-1 items-center justify-center">
          <button
            className="w-6 h-6 bg-lime-500  text-white rounded-md font-extrabold flex items-center justify-center"
            onClick={handleDecrement}
          >
            -
          </button>
          <span className="text-white font-bold">
            {data.level}/{data.maxLevel}
          </span>
          <button
            className="w-6 h-6 bg-green-500 text-white rounded-md font-extrabold flex items-center justify-center"
            onClick={handleIncrement}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default MinorNode;
