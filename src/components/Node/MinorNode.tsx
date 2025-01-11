import { handlerRadius } from "@/types/Values";
import React, { useState, useEffect } from "react";
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
  const { nodeName, handles, maxLevel, nodeId, nodeDescription, unlocked, coolDown, lastUpgradeTime } = data;
  const [showDescription, setShowDescription] = useState(false);
  const [cooldownProgress, setCooldownProgress] = useState(0);



  // 状态颜色和图片滤镜初始化
  let bgColor = "bg-gray-700"; // 默认锁定状态灰色
  let imgFilter =
    userRole === "teacher" || unlocked ? "grayscale(0%)" : "grayscale(100%)";
  let opacity = userRole === "teacher" || unlocked ? 1 : 0.5;
  // 如果节点解锁
  if (unlocked) {
    bgColor = "bg-yellow-700"; // 解锁状态黄色
    imgFilter = "none"; // 取消图片置灰
    // 如果达到最大等级
    if (data.level === maxLevel) {
      bgColor = "bg-green-700"; // 满级状态绿色
    }
  }

  useEffect(() => {
    if (coolDown && lastUpgradeTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const lastUpgrade = new Date(lastUpgradeTime).getTime();
        const elapsed = (now - lastUpgrade) / 1000;
        const progress = Math.min((elapsed / coolDown) * 100, 100);
        setCooldownProgress(progress);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [coolDown, lastUpgradeTime]);

  const handleIncrement = () => {
    if (cooldownProgress === 100) {
      handleLevelChange && handleLevelChange(data.nodeId, +1);
    }
  };

  const handleDecrement = () => {
    handleLevelChange && handleLevelChange(data.nodeId, -1);
  };

  return (
    <div
      onContextMenu={(event) => onContextMenu(event, data)}
      onMouseEnter={() => setShowDescription(true)}
      onMouseLeave={() => setShowDescription(false)}
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
          src={data.picUrl || "/images/minornode_default_icon.jpg"}
          alt="minor node"
          className="w-full h-full object-cover rounded-full"
          style={{ filter: imgFilter }} // 根据状态调整图片灰度
        />
        <div className="relative">
          <svg
            className="absolute top-0 left-0"
            width={radius * 2}
            height={radius * 2}
          >
            <circle
              cx={radius}
              cy={radius}
              r={radius - 5}
              stroke="gray"
              strokeWidth="5"
              fill="none"
            />
            <circle
              cx={radius}
              cy={radius}
              r={radius - 5}
              stroke="lime"
              strokeWidth="5"
              fill="none"
              strokeDasharray={`${2 * Math.PI * (radius - 5)}`}
              strokeDashoffset={`${
                2 * Math.PI * (radius - 5) * ((100 - cooldownProgress) / 100)
              }`}
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          </svg>
        </div>
      </div>

      {/* 鼠标悬停时显示描述 */}
      {showDescription && (
        <div
          className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-sm rounded shadow-lg"
          style={{ whiteSpace: "nowrap" }}
        >
          {nodeDescription}
        </div>
      )}

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
      <div
        className={`fixed top-0 text-[8px] bg-gray-900 rounded-lg text-center border-3 
        border-green-900 rtext-white items-end p-1 w-4/5`}
      ></div>
      <div className="fixed top-0 text-[8px] bg-gray-900 rounded-lg text-center border-3 border-green-900 text-white items-end p-1 w-4/5">
        <div>{nodeName}</div>
        {userRole === "teacher" && <div>maxlevel:{maxLevel}</div>}
      </div>

      {/* 学生的等级调整面板 */}
      {userRole === "student" && (
        <div className="fixed -bottom-4 -right-4 w-3/5 h-8 bg-gray-900 rounded-b-lg flex p-1 space-x-1 items-center justify-center">
          <button
            className="w-6 h-6 bg-lime-500 text-white rounded-md font-extrabold flex items-center justify-center"
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

      {userRole === "otherStudent" && (
        <div className="fixed -bottom-4 -right-4 w-3/5 h-8 bg-gray-900 rounded-b-lg flex p-1 space-x-1 items-center justify-center">
          <span className="text-white font-bold">
            {data.level}/{data.maxLevel}
          </span>
        </div>
      )}
    </div>
  );
};

export default MinorNode;
