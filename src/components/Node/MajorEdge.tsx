// MajorEdge.tsx
import { handlerRadius } from "@/types/Values";
import React from "react";
import { EdgeProps, getStraightPath } from "reactflow";

const MajorEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const adjustedSourceX = sourceX + handlerRadius;
  const adjustedSourceY = sourceY;
  const adjustedTargetX = targetX + handlerRadius;
  const adjustedTargetY = targetY;

  const [edgePath] = getStraightPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  });

  return (
    <path
      id={id}
      style={{ stroke: "red", strokeWidth: 2, ...style }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

export default MajorEdge;
