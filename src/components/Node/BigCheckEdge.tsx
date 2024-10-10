// ProgressEdge.tsx
import { handlerRadius } from "@/types/Values";
import React, { useEffect, useRef, useState } from "react";
import { EdgeProps, getStraightPath } from "reactflow";

const BigCheckEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
}: EdgeProps) => {
  const pathRef = useRef<SVGPathElement>(null); // 引用 SVG path
  const [pathLength, setPathLength] = useState(0); // 路径的总长度
  const progress = data?.progress || 0; // 假设 progress 是 0-100 之间的数值
  const unlockDepNodeCount = data?.unlockDepNodeCount || 0; // 获取 unlockDepNodeCount
  const userRole = data?.userRole || "teacher";
  const unlockDepClusterTotalSkillPt = data?.unlockDepClusterTotalSkillPt || 1; // 获取 unlockDepClusterTotalSkillPt

  // 使用 useEffect 获取路径的总长度
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathRef]);

  const adjustedSourceX = sourceX + handlerRadius;
  const adjustedSourceY = sourceY + handlerRadius;
  const adjustedTargetX = targetX + handlerRadius;
  const adjustedTargetY = targetY + handlerRadius;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  });

  // 动态计算 strokeDasharray 和 strokeDashoffset
  const dashArray = pathLength;
  const dashOffset = pathLength * (progress / 100); // 计算进度的偏移量

  return (
    <>
      {/* 背景边 */}
      <path
        id={id}
        style={{ stroke: "green", strokeWidth: 4 }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        ref={pathRef} // 设置引用
      />
      {/* 进度边 */}
      <path
        id={`${id}-progress`}
        style={{ stroke: "#ddd", strokeWidth: 4 }}
        className="react-flow__edge-path"
        d={edgePath}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
      />
      {/* 显示 unlockDepClusterTotalSkillPt 的文本 */}
      {userRole === "teacher" && (
        <text
          x={labelX}
          y={labelY}
          fontSize="30px"
          textAnchor="middle"
          dy="-5"
          className="text-slate-800"
        >
          {unlockDepClusterTotalSkillPt} Skill Points to Unlock
        </text>
      )}
    </>
  );
};

export default BigCheckEdge;
