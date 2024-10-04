// ProgressEdge.tsx
import { handlerRadius } from "@/types/Values";
import React from "react";
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
  const adjustedSourceX = sourceX + handlerRadius;
  const adjustedSourceY = sourceY + handlerRadius;
  const adjustedTargetX = targetX + handlerRadius;
  const adjustedTargetY = targetY + handlerRadius;

  const [edgePath] = getStraightPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  });

  const progress = data?.progress || 0;

  return (
    <>
      {/* 背景边 */}
      <path
        id={id}
        style={{ stroke: "#ddd", strokeWidth: 4 }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* 进度边 */}
      <path
        id={`${id}-progress`}
        style={{ stroke: "green", strokeWidth: 4 }}
        className="react-flow__edge-path"
        d={edgePath}
        strokeDasharray="100%"
        strokeDashoffset={`${(1 - progress) * 100}%`}
      />
    </>
  );
};

export default BigCheckEdge;
