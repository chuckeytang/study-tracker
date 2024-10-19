import React, { useEffect, useState } from "react";
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
  updateSkillTree: () => void;
  onContextMenu: (event: React.MouseEvent, nodeData: any) => void;
}

const BigCheck: React.FC<BigCheckProps> = ({
  id,
  data,
  selected,
  userRole = "teacher",
  radius = bigCheckRadius,
  onContextMenu,
}) => {
  const { nodeName, handles, nodeId, nodeDescription, unlocked } = data;

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

  return (
    <div
      onContextMenu={(event) => onContextMenu(event, data)}
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
          src={data.picUrl}
          alt="big check"
          className="w-full h-full object-cover rounded-full"
          style={{
            filter: imgFilter, // 根据状态置灰图片
          }}
        />
      </div>
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
      <div className="fixed -bottom-6 -right-4 text-[18px] bg-gray-900 rounded-md text-end text-white items-end p-[4px] w-3/5">
        <div>{nodeName}</div>
      </div>
    </div>
  );
};

export default BigCheck;
