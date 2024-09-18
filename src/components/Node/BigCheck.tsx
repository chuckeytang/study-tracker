import React, { useState } from "react";
import NodeForm from "@/components/Form/NodeForm";

interface BigCheckProps {
  id?: number;
  name: string;
  description: string;
  courseId: number;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  selected?: boolean;
  picUrl?: string;
  updateSkillTree: () => void;
}

const BigCheck: React.FC<BigCheckProps> = ({
  id,
  name,
  picUrl,
  description,
  level,
  unlocked,
  maxLevel,
  selected,
  updateSkillTree,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [formVisible, setFormVisible] = useState(false);
  const [formType, setFormType] = useState<"create" | "edit" | null>(null);
  const [formData, setFormData] = useState<any>({}); // 存储节点表单数据

  // 右键菜单的触发事件
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({ x: event.pageX, y: event.pageY });
    setMenuVisible(true);
  };

  // 隐藏菜单
  const closeMenu = () => {
    setMenuVisible(false);
  };

  // 菜单选项点击
  const handleCreateNode = () => {
    setFormType("create");
    setFormData({}); // 清空数据，准备创建新节点
    setFormVisible(true);
    closeMenu();
  };

  const handleEditNode = () => {
    setFormType("edit");
    setFormData({ name, description: "", level, maxLevel }); // 设置当前节点数据用于编辑
    setFormVisible(true);
    closeMenu();
  };

  // 提交表单后的处理
  const handleFormSubmit = (nodeData: any) => {
    if (formType === "create") {
      console.log("Creating new node with data:", nodeData);
    } else if (formType === "edit") {
      console.log("Editing node with data:", nodeData);
    }
    setFormVisible(false); // 关闭表单
  };

  const handleDeleteNode = async () => {
    try {
      const response = await fetch("/api/teacher/deleteNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: 1, nodeId: id }), // 假设 teacherId 是 1
      });

      const result = await response.json();
      if (result.success) {
        console.log("Node deleted successfully");
        // 调用更新函数，例如重新获取课程信息
        updateSkillTree();
      } else {
        console.error("Failed to delete node");
      }
    } catch (error) {
      console.error("Error deleting node:", error);
    }
    closeMenu();
  };

  let borderColor = "border-gray-400"; // 默认锁定状态灰色
  if (unlocked) {
    borderColor = "border-amber-900"; // 解锁状态
    if (level === maxLevel) {
      borderColor = "border-green-500"; // 满级状态绿色
    }
  }

  if (selected) {
    borderColor = "border-blue-500"; // 选中状态蓝色
  }
  return (
    <div
      onContextMenu={handleContextMenu}
      className={`flex items-center justify-center w-[100px] h-[100px] bg-transparent border-8 ${borderColor} rounded-full text-gray-800 font-bold`}
    >
      <div className="w-[70px] h-[70px] rounded-full overflow-hidden">
        {picUrl ? (
          <img src={picUrl} alt={name} className="w-[70px] h-[70px]" />
        ) : (
          <img
            src="/images/bigcheck_default_icon.jpg"
            alt={name}
            className="w-[70px] h-[70px]"
          />
        )}
      </div>

      {menuVisible && (
        <div
          className="absolute bg-white shadow-lg p-2 rounded-lg"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <ul>
            <li className="p-2 hover:bg-gray-200" onClick={handleCreateNode}>
              Create New Dependent Node
            </li>
            <li className="p-2 hover:bg-gray-200" onClick={handleEditNode}>
              Edit Node
            </li>
            <li className="p-2 hover:bg-gray-200" onClick={handleDeleteNode}>
              Delete Node
            </li>
          </ul>
        </div>
      )}

      {formVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative">
            <NodeForm
              onSubmit={handleFormSubmit}
              defaultValue={formType === "edit" ? formData : {}}
            />
            <button
              onClick={() => setFormVisible(false)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BigCheck;
