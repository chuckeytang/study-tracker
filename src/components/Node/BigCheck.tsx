import React, { useEffect, useState, useRef } from "react";
import { Handle, HandleType, Position } from "reactflow";
import { bigCheckRadius, handlerRadius } from "@/types/Values";

interface BigCheckProps {
  id?: number;
  data: any;
  courseId: number;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  selected?: boolean;
  radius: number;
  userRole: "teacher" | "student" | "otherStudent";
  onContextMenu: (event: React.MouseEvent, nodeData: any) => void;
  handleUpdateSkillTreeStatus?: (nodeId: string) => void;
}

const BigCheck: React.FC<BigCheckProps> = ({
  id,
  data,
  selected,
  userRole = "teacher",
  radius = bigCheckRadius,
  onContextMenu,
  handleUpdateSkillTreeStatus,
}) => {
  const { nodeName, handles, nodeId, nodeDescription, unlocked, unlockType, unlockDepTimeInterval, unlockStartTime } = data;
  const [showDescription, setShowDescription] = useState(false);
  const [timeBasedProgress, setTimeBasedProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const updateSkillTreeTimeoutRef = useRef<number | null>(null);

  let bgColor = "bg-gray-700"; // 默认锁定状态灰色
  let imgFilter =
    userRole === "teacher" || unlocked ? "grayscale(0%)" : "grayscale(100%)"; // 默认图片置灰
  let opacity = userRole === "teacher" || unlocked ? 1 : 0.5;

  // 根据不同状态设置颜色和透明度
  if (unlocked) {
    bgColor = "bg-yellow-700"; // 解锁状态
    imgFilter = "none"; // 解锁后取消置灰
  }

  if (selected) {
    bgColor = "bg-blue-700"; // 选中状态蓝色
  }
  // Use the passed function to update the skill tree status
  const updateStatus = () => {
    handleUpdateSkillTreeStatus && handleUpdateSkillTreeStatus(data.nodeId);
  };

  // Dynamic calculation of time-based unlock progress
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

        // Auto-unlock logic
        if (progress >= 100) {
          if (updateSkillTreeTimeoutRef.current) {
            clearTimeout(updateSkillTreeTimeoutRef.current);
            updateSkillTreeTimeoutRef.current = null;
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current); // Clear timer
            intervalRef.current = null; // Prevent subsequent calls
          }
          updateSkillTreeTimeoutRef.current = window.setTimeout(() => {
            updateStatus(); // Update the node status
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

  const r = 50;
  const strokeWidth = 12;
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
        className={`flex items-center justify-center rounded-full ${bgColor} font-bold`}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          transform: "translate(-50%, -50%)", // 调整节点使其中心与 position 对齐
          boxSizing: "border-box",
          opacity: opacity,
        }}
      >
        <div className="rounded-full bg-white w-11/12 h-11/12 overflow-hidden">
          <img
            src={data.picUrl || "/images/bigcheck_default_icon.jpg"}
            alt="big check"
            className="w-full h-full object-cover rounded-full"
            style={{
              filter: imgFilter, // 根据状态置灰图片
            }}
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
        {/* 动态添加句柄 */}
        {handles &&
          handles.map(
            (
              handle: {
                type: HandleType;
                position: { x: number; y: number };
                id: string;
              },
              index: any
            ) => (
              <Handle
                key={index}
                type={handle.type}
                position={Position.Left} // 必需属性，用于计算定位
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
        <div className="fixed top-0 text-[18px] text-center bg-gray-900 rounded-md text-white items-end p-[4px] w-full">
          <div>{nodeName}</div>
        </div>
      </div>

      <div>
        {unlockType === "TIME_BASED" && !unlocked && (
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
                fill="transparent"
                stroke="rgba(71, 224, 111, 1)"
                strokeDasharray={(r * 2 * Math.PI * 3.7) / 2}
                strokeDashoffset={
                  ((r * 2 * Math.PI * 3.7) / 2) * (1 - timeBasedProgress / 100)
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

export default BigCheck;
