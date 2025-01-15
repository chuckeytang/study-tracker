import { handlerRadius } from "@/types/Values";
import React, { useState, useEffect, useRef } from "react";
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
  } = data;
  const [showDescription, setShowDescription] = useState(false);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [timeBasedProgress, setTimeBasedProgress] = useState(0);
  const intervalRef = useRef<number | null>(null); // 使用 useRef 保存定时器 ID
  const upgradeTimeoutRef = useRef<number | null>(null); // 使用 useRef 保存升级定时器 ID

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

  // 动态计算冷却进度
  useEffect(() => {
    const calculateCooldownProgress = () => {
      if (lastUpgradeTime && coolDown) {
        const lastUpgradeTimeMs = new Date(lastUpgradeTime).getTime();
        const currentTime = Date.now();
        const elapsedTime = (currentTime - lastUpgradeTimeMs) / 1000; // 转换为秒
        const progress = Math.max(0, 100 - (elapsedTime / coolDown) * 100);
        setCooldownProgress(progress);
      } else {
        setCooldownProgress(0); // 没有冷却时，直接设置为 0
      }
    };

    // 初始化计算一次冷却进度
    calculateCooldownProgress();

    // 每秒更新冷却进度
    const interval = setInterval(calculateCooldownProgress, Math.max(coolDown * 10, 100));

    return () => clearInterval(interval); // 清理定时器
  }, [lastUpgradeTime, coolDown]);

  // 动态计算时间解锁进度
  useEffect(() => {
    if (unlockType === "TIME_BASED" && unlockDepTimeInterval && unlocked) {
      const calculateTimeBasedProgress = () => {
        if (lastUpgradeTime) {
          const lastUpgradeTimeMs = new Date(lastUpgradeTime).getTime();
          const currentTime = Date.now();
          const elapsedTime = (currentTime - lastUpgradeTimeMs) / 1000;
          const progress = Math.min(
            100,
            (elapsedTime / unlockDepTimeInterval) * 100
          );
          setTimeBasedProgress(progress);

          // 自动升级逻辑
          if (progress >= 100 && data.level < maxLevel) {
            if (upgradeTimeoutRef.current) {
              clearTimeout(upgradeTimeoutRef.current);
              upgradeTimeoutRef.current = null;
            }
            if (intervalRef.current) {
              clearInterval(intervalRef.current); // 清除定时器
              intervalRef.current = null; // 防止后续调用
            }
            upgradeTimeoutRef.current = window.setTimeout(() => {
              handleLevelChange && handleLevelChange(data.nodeId, +1);
              setTimeBasedProgress(0); // Reset progress after upgrade
            }, 1000); // 1-second delay
          }
        } else {
          setTimeBasedProgress(0);
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
        if (upgradeTimeoutRef.current) {
          clearTimeout(upgradeTimeoutRef.current);
          upgradeTimeoutRef.current = null;
        }
      };
    }
  }, [lastUpgradeTime, unlocked]);

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

  // SVG 进度条相关计算
  const r = 50;
  const strokeWidth = 8;
  const strokeLinecap = "round"; // 圆角端点
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
        className={`flex items-center justify-center rounded-full text-white font-semibold ${bgColor}`}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          transform: "translate(-50%, -50%)",
          opacity: opacity, // 根据状态调整透明度
        }}
      >
        <div className="rounded-full bg-white w-11/12 h-11/12 overflow-hidden relative">
          <img
            src={data.picUrl || "/images/minornode_default_icon.jpg"}
            alt="minor node"
            className="w-full h-full object-cover rounded-full"
            style={{ filter: imgFilter }} // 根据状态调整图片灰度
          />
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
        {userRole === "student" && unlockType !== "TIME_BASED" && (
          <div className="fixed -bottom-4 -right-4 w-3/5 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
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

        {userRole === "student" && unlockType === "TIME_BASED" && (
          <div className="fixed -bottom-4 -right-4 w-3/5 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
            <span className="text-white font-bold">
              {data.level}/{data.maxLevel}
            </span>
          </div>
        )}

        {userRole === "otherStudent" && (
          <div className="fixed -bottom-4 -right-4 w-3/5 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
            <span className="text-white font-bold">
              {data.level}/{data.maxLevel}
            </span>
          </div>
        )}
      </div>
      {/* SVG 进度条 */}
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

        {unlockType === "TIME_BASED" && data.level < maxLevel && (
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

export default MinorNode;
