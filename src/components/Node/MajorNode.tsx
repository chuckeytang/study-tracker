import { handlerRadius } from "@/types/Values";
import React, { useState, useEffect, useRef } from "react";
import { Handle, HandleType, Position } from "reactflow";
import { apiRequest } from "@/utils/api";

interface MajorNodeProps {
  data: any;
  radius: number;
  selected?: boolean;
  userRole: "teacher" | "student" | "otherStudent";
  onContextMenu: (event: React.MouseEvent, nodeData: any) => void;
  handleLevelChange?: (nodeId: string, delta: number) => void;
  handleUpdateSkillTreeStatus?: (nodeId: string) => void;
}

const MajorNode: React.FC<MajorNodeProps> = ({
  data,
  radius,
  selected,
  userRole = "teacher",
  onContextMenu,
  handleLevelChange,
  handleUpdateSkillTreeStatus,
}) => {
  const {
    nodeName,
    handles,
    maxLevel,
    nodeId,
    nodeDescription,
    unlocked,
    coolDown,
    lastUpgradeTime,
    unlockType,
    unlockDepTimeInterval,
    unlockStartTime,
    exp,
    rewardPt,
  } = data;
  const [showDescription, setShowDescription] = useState(false);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [timeBasedProgress, setTimeBasedProgress] = useState(0);
  const intervalRef = useRef<number | null>(null); // 使用 useRef 保存定时器 ID
  const updateSkillTreeTimeoutRef = useRef<number | null>(null); // 使用 useRef 保存更新技能树定时器 ID

  let bgColor = "bg-gray-700"; // 默认锁定状态灰色
  let imgFilter =
    userRole === "teacher" || unlocked ? "grayscale(0%)" : "grayscale(100%)"; // 默认图片置灰
  let opacity = userRole === "teacher" || unlocked ? 1 : 0.5;

  // 根据不同状态设置颜色和透明度
  if (unlocked) {
    bgColor = "bg-yellow-700"; // 解锁状态
    if (data.level === data.maxLevel) {
      bgColor = "bg-green-700"; // 满级状态绿色
    }
  }

  if (selected) {
    bgColor = "bg-blue-700"; // 选中状态蓝色
  }

  // 动态计算冷却进度
  useEffect(() => {
    const calculateCooldownProgress = () => {
      if (data.level < maxLevel && lastUpgradeTime && coolDown) {
        const lastUpgradeTimeMs = new Date(lastUpgradeTime).getTime();
        const currentTime = Date.now();
        const elapsedTime = (currentTime - lastUpgradeTimeMs) / 1000;
        const progress = Math.max(0, 100 - (elapsedTime / coolDown) * 100);
        setCooldownProgress(progress);
      } else {
        setCooldownProgress(0);
      }
    };

    calculateCooldownProgress();

    const interval = setInterval(calculateCooldownProgress, Math.max(coolDown * 10, 100));

    return () => clearInterval(interval);
  }, [lastUpgradeTime, coolDown, data.level]);

  // Use the passed function to update the skill tree status
  const updateStatus = () => {
    handleUpdateSkillTreeStatus && handleUpdateSkillTreeStatus(data.nodeId);
  };

  // 动态计算时间解锁进度
  useEffect(() => {
    if (unlockType === "TIME_BASED" && unlockDepTimeInterval && unlockStartTime) {
      const calculateTimeBasedProgress = () => {
        const unlockStartTimeMs = new Date(unlockStartTime).getTime();
        const currentTime = Date.now();
        const elapsedTime = (currentTime - unlockStartTimeMs) / 1000;
        const progress = Math.min(
          100,
          (elapsedTime / unlockDepTimeInterval) * 100
        );
        setTimeBasedProgress(progress);

        // 自动解锁逻辑
        if (progress >= 100) {
          if (updateSkillTreeTimeoutRef.current) {
            clearTimeout(updateSkillTreeTimeoutRef.current);
            updateSkillTreeTimeoutRef.current = null;
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current); // 清除定时器
            intervalRef.current = null; // 防止后续调用
          }
          updateSkillTreeTimeoutRef.current = window.setTimeout(() => {
            updateStatus(); // Call the update function with nodeId
            setTimeBasedProgress(0); // Reset progress after update
          }, 1000); // 1-second delay
        }
      };

      calculateTimeBasedProgress();

      intervalRef.current = window.setInterval(
        calculateTimeBasedProgress,
        unlockDepTimeInterval * 10
      );

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (updateSkillTreeTimeoutRef.current) {
          clearTimeout(updateSkillTreeTimeoutRef.current);
          updateSkillTreeTimeoutRef.current = null;
        }
      };
    }
  }, [unlockStartTime, unlocked]);

  const handleIncrement = () => {
    if (cooldownProgress === 0 && data.level < maxLevel) {
      handleLevelChange && handleLevelChange(data.nodeId, +1);
    }
  };

  const handleDecrement = () => {
    if (cooldownProgress === 0 && data.level > 0) {
      handleLevelChange && handleLevelChange(data.nodeId, -1);
    }
  };

  const r = 50;
  const strokeWidth = 10;
  const strokeLinecap = "round"; // 或 'round' 或 'square'
  const halfStrokeWidth = strokeWidth / 2;

  let scale = (r - halfStrokeWidth) / r;

  if (strokeLinecap === "round") {
    scale = (r - (halfStrokeWidth * Math.sqrt(2)) / 2) / r;
  } else if (strokeLinecap === "square") {
    scale = (r - halfStrokeWidth) / r;
  }

  const translate = (1 - scale) * r;

  return (
    <div className="relative"
        onContextMenu={(event) => onContextMenu(event, data)}
        onMouseEnter={() => setShowDescription(true)}
        onMouseLeave={() => setShowDescription(false)}>
      <div
        className={`flex items-center justify-center ${bgColor} rounded-full text-white font-semibold`}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          transform: "translate(-50%, -50%)", // 调整节点使其中心与 position 对齐
          opacity: opacity,
        }}
      >
        <div className="rounded-full bg-white w-11/12 h-11/12 overflow-hidden relative">
          <img
            src={data.picUrl || "/images/majornode_default_icon.jpg"}
            alt="big check"
            className="w-full h-full object-cover rounded-full"
            style={{
              filter: imgFilter,
            }}
          />
        </div>

        {/* 鼠标悬停时显示描述 */}
        {showDescription && (
          <div
            className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-base rounded shadow-lg"
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
        <div
          className={`fixed top-0 text-[12px] bg-gray-900 rounded-lg text-center border-3 border-green-900 rtext-white items-end p-1 pr-2 w-4/5`}
        >
          <div>{nodeName}</div>
          {userRole === "teacher" && <div>maxlevel:{maxLevel}</div>}
        </div>

        {userRole === "student" && (
          <div className="fixed -bottom-2 -right-4 w-1/2 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
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

        {userRole === "otherStudent" && (
          <div className="fixed -bottom-6 -right-4 w-1/2 h-8 bg-gray-900 rounded-b-lg flex p-1 space-x-1 items-center justify-center">
            <span>
              {data.level}/{data.maxLevel}
            </span>
          </div>
        )}

        {/* Display Experience at 8 o'clock position */}
        <div className="absolute -bottom-2 -left-4 w-1/2 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
          <span className="text-white font-bold">
            Exp: {exp}
          </span>
        </div>

        {/* Display Reward Points at 6 o'clock position */}
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-2/3 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
          <span className="text-white font-bold">
            Reward: {rewardPt}
          </span>
        </div>
      </div>

      <div>
        <svg
          className="absolute inset-0"
          style={{
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            transform: "translate(-50%, -50%)",
            opacity: opacity,
          }}
          viewBox="0 0 100 100"
        >
          <g transform={`scale(${scale}) translate(${translate} ${translate})`}>
            <circle
              cx="50"
              cy="50"
              r={r}
              fill={cooldownProgress > 0 ? "rgba(0, 0, 0, 0.5)" : "transparent"}
              stroke="rgba(224, 71,111, 1)"
              strokeDasharray={(r * 2 * Math.PI * 3) / 2}
              strokeDashoffset={
                ((r * 2 * Math.PI * 3) / 2) * (1 - cooldownProgress / 100)
              }
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
              transform="rotate(-90 50 50)"
            />
          </g>
        </svg>

        {unlockType === "TIME_BASED" && !unlocked  && (
          <svg
            className="absolute inset-0"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              transform: "translate(-50%, -50%)",
              opacity: opacity,
            }}
            viewBox="0 0 100 100"
          >
            <g
              transform={`scale(${scale}) translate(${translate} ${translate})`}
            >
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="rgba(71, 224, 111, 1)"
                strokeDasharray={(r * 2 * Math.PI * 3) / 2}
                strokeDashoffset={
                  ((r * 2 * Math.PI * 3) / 2) * (1 - timeBasedProgress / 100)
                }
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
                transform="rotate(-90 50 50)"
              />
            </g>
          </svg>
        )}
      </div>
    </div>
  );
};

export default React.memo(MajorNode);
