// MajorEdge.tsx
import React from "react";
import { EdgeProps, getStraightPath } from "reactflow";

const BigCheckEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
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

export default BigCheckEdge;
