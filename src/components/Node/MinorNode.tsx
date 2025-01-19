import { handlerRadius } from "@/types/Values";
import React, { useState, useEffect, useRef } from "react";
import { Handle, HandleType, Position } from "reactflow";

interface MinorNodeProps {
  data: any;
  radius: number;
  userRole: "teacher" | "student" | "otherStudent";
  onContextMenu: (event: React.MouseEvent, nodeData: any) => void;
  handleLevelChange?: (nodeId: string, delta: number) => void;
  handleUpdateSkillTreeStatus?: (nodeId: string) => void;
}

const MinorNode: React.FC<MinorNodeProps> = ({
  data,
  radius,
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
  const intervalRef = useRef<number | null>(null);
  const updateSkillTreeTimeoutRef = useRef<number | null>(null);

  let bgColor = "bg-gray-700";
  let imgFilter =
    userRole === "teacher" || unlocked ? "grayscale(0%)" : "grayscale(100%)";
  let opacity = userRole === "teacher" || unlocked ? 1 : 0.5;

  if (unlocked) {
    bgColor = "bg-yellow-700";
    imgFilter = "none";
    if (data.level === maxLevel) {
      bgColor = "bg-green-700";
    }
  }

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

    const interval = setInterval(
      calculateCooldownProgress,
      Math.max(coolDown * 10, 100)
    );

    return () => clearInterval(interval);
  }, [lastUpgradeTime, coolDown, data.level]);

  const updateStatus = () => {
    handleUpdateSkillTreeStatus && handleUpdateSkillTreeStatus(data.nodeId);
  };

  useEffect(() => {
    if (
      unlockType === "TIME_BASED" &&
      unlockDepTimeInterval &&
      unlockStartTime
    ) {
      const calculateTimeBasedProgress = () => {
        const unlockStartTimeMs = new Date(unlockStartTime).getTime();
        const currentTime = Date.now();
        const elapsedTime = (currentTime - unlockStartTimeMs) / 1000;
        const progress = Math.min(
          100,
          (elapsedTime / unlockDepTimeInterval) * 100
        );
        setTimeBasedProgress(progress);

        if (progress >= 100) {
          if (updateSkillTreeTimeoutRef.current) {
            clearTimeout(updateSkillTreeTimeoutRef.current);
            updateSkillTreeTimeoutRef.current = null;
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          updateSkillTreeTimeoutRef.current = window.setTimeout(() => {
            updateStatus();
            setTimeBasedProgress(0);
          }, 1000);
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
  const strokeWidth = 8;
  const strokeLinecap = "round";
  const halfStrokeWidth = strokeWidth / 2;

  let scale = (r - halfStrokeWidth) / r;

  if (strokeLinecap === "round") {
    scale = (r - (halfStrokeWidth * Math.sqrt(2)) / 2) / r;
  } else if (strokeLinecap === "square") {
    scale = (r - halfStrokeWidth) / r;
  }

  const translate = (1 - scale) * r;

  return (
    <div
      className="relative"
      onContextMenu={(event) => onContextMenu(event, data)}
      onMouseEnter={() => setShowDescription(true)}
      onMouseLeave={() => setShowDescription(false)}
    >
      <div
        className={`flex items-center justify-center rounded-full text-white font-semibold ${bgColor}`}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          transform: "translate(-50%, -50%)",
          opacity: opacity,
        }}
      >
        <div className="rounded-full bg-white w-11/12 h-11/12 overflow-hidden relative">
          <img
            src={data.picUrl || "/images/minornode_default_icon.jpg"}
            alt="minor node"
            className="w-full h-full object-cover rounded-full"
            style={{ filter: imgFilter }}
          />
        </div>

        {showDescription && (
          <div
            className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-base rounded shadow-lg"
            style={{ whiteSpace: "nowrap" }}
          >
            {nodeDescription}
          </div>
        )}

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

        <div
          className={`fixed top-0 text-[8px] bg-gray-900 rounded-lg text-center border-3 
          border-green-900 rtext-white items-end p-1 w-4/5`}
        ></div>
        <div className="fixed top-0 text-[8px] bg-gray-900 rounded-lg text-center border-3 border-green-900 text-white items-end p-1 w-4/5">
          <div>{nodeName}</div>
          {userRole === "teacher" && <div>maxlevel:{maxLevel}</div>}
        </div>

        {userRole === "student" && (
          <div className="fixed -bottom-2 -right-4 w-3/5 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
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
          <div className="fixed -bottom-4 -right-4 w-3/5 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
            <span className="text-white font-bold">
              {data.level}/{data.maxLevel}
            </span>
          </div>
        )}

        {userRole === "student" && (
          <div className="absolute -bottom-2 -left-4 w-1/2 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
            <span className="text-white font-bold text-sm">Exp: {exp}</span>
          </div>
        )} 

        {userRole === "student" && (
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-2/3 h-8 bg-gray-900 rounded-lg flex p-1 space-x-1 items-center justify-center">
            <span className="text-white font-bold text-sm">
              Reward: {rewardPt}
            </span>
          </div>
        )}
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
            <g
              transform={`scale(${scale}) translate(${translate} ${translate})`}
            >
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="rgba(71, 224, 111, 1)"
                strokeDasharray={(r * 2 * Math.PI * 2.27) / 2}
                strokeDashoffset={
                  ((r * 2 * Math.PI * 2.27) / 2) * (1 - timeBasedProgress / 100)
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
