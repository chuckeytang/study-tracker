import { apiRequest } from "@/utils/api";
import React, { useEffect, useState } from "react";

const NodeForm: React.FC<{
  onSubmit: (formType: "create" | "edit" | null, data: any) => void;
  formType: "create" | "edit" | null;
  defaultValue?: any;
  nodeId?: number;
  parentNodeId?: number;
  courseId?: string;
}> = ({
  formType,
  onSubmit,
  defaultValue = {},
  nodeId,
  parentNodeId,
  courseId,
}) => {
  const [name, setName] = useState(defaultValue.nodeName || "");
  const [description, setDescription] = useState(
    defaultValue.nodeDescription || ""
  );
  const [nodeType] = useState(defaultValue.nodeType || "BIGCHECK");
  const [maxLevel, setMaxLevel] = useState(defaultValue.maxLevel || 1);
  const [lockDepNodeCount, setLockDepNodeCount] = useState(
    defaultValue.lockDepNodeCount || null
  );
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [unlockDepNodes, setUnlockDepNodes] = useState([]); // 解锁依赖节点列表
  const [selectedUnlockNodes, setSelectedUnlockNodes] = useState<string[]>([]); // 解锁依赖节点选择

  const [lockDepNodes, setLockDepNodes] = useState([]); // 锁定依赖节点列表
  const [selectedLockNodes, setSelectedLockNodes] = useState<string[]>([]); // 锁定依赖节点选择
  const [alreadyLockedNodeIds, setAlreadyLockedNodeIds] = useState<string[]>(
    []
  );

  // 获取解锁依赖节点列表

  useEffect(() => {
    const fetchUnlockDepNodes = async () => {
      try {
        // 构建 API 请求 URL
        const unlockDepUrl = nodeId
          ? `/api/teacher/getUnlockDepNodeList?courseId=${courseId}&nodeId=${nodeId}`
          : parentNodeId
          ? `/api/teacher/getUnlockDepNodeList?courseId=${courseId}&parentNodeId=${parentNodeId}`
          : `/api/teacher/getUnlockDepNodeList?courseId=${courseId}`;

        // 使用 apiRequest 调用 API
        const data = await apiRequest(unlockDepUrl);

        // 设置解锁依赖节点的数据
        setUnlockDepNodes(data.data || []);
      } catch (error) {
        console.error("Error fetching unlock dependency nodes:", error);
      }
    };

    // 调用异步函数
    fetchUnlockDepNodes();
  }, [nodeId, parentNodeId]);

  useEffect(() => {
    const fetchLockDepNodes = async () => {
      try {
        const lockDepUrl = nodeId
          ? `/api/teacher/getLockDepNodeList?courseId=${courseId}&nodeId=${nodeId}`
          : parentNodeId
          ? `/api/teacher/getLockDepNodeList?courseId=${courseId}&parentNodeId=${parentNodeId}`
          : null;

        if (lockDepUrl) {
          // 使用 apiRequest 调用 API
          const data = await apiRequest(lockDepUrl);
          setLockDepNodes(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching lock dependency nodes:", error);
      }
    };

    const fetchAlreadyLockedNodes = async () => {
      try {
        if (formType === "edit" && nodeId && nodeType !== "BIGCHECK") {
          const data = await apiRequest(
            `/api/teacher/getAlreadyLockDepNodeList?courseId=${courseId}&nodeId=${nodeId}`
          );

          const lockedNodeIds = data.data.map((node: any) =>
            node.nodeId.toString()
          );
          setAlreadyLockedNodeIds(lockedNodeIds);
          setSelectedLockNodes(lockedNodeIds); // 预先选中已锁定的节点
        }
      } catch (error) {
        console.error("Error fetching already locked nodes:", error);
      }
    };

    // 调用异步函数获取数据
    fetchLockDepNodes();
    fetchAlreadyLockedNodes();
  }, [formType, nodeId, parentNodeId, nodeType]);

  // 合并候选节点和已锁定的节点，并自动选中已锁定的节点
  const mergedLockDepNodes = [
    ...lockDepNodes.filter(
      (node: any) => !alreadyLockedNodeIds.includes(node.id.toString())
    ), // 过滤掉已锁定的节点，避免重复
    ...alreadyLockedNodeIds
      .map((id) => lockDepNodes.find((node: any) => node.id.toString() === id))
      .filter(Boolean), // 将已锁定节点添加到列表中
  ];

  // 提交表单
  const handleSubmit = () => {
    const nodeData = {
      nodeId,
      name,
      description,
      nodeType,
      maxLevel,
      iconFile,
      lockDepNodeCount,
      selectedUnlockNodes,
      selectedLockNodes,
    };
    onSubmit(formType, nodeData);
  };
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col text-gray-800">
      <h2 className="text-lg font-bold mb-4">Node Form</h2>

      {/* 基本信息输入 */}
      <div className="flex items-center mb-2">
        <label className="w-1/3 font-semibold">Name:</label>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-2/3"
        />
      </div>

      <div className="flex items-center mb-2">
        <label className="w-1/3 font-semibold">Description:</label>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border border-gray-300 rounded w-2/3"
        />
      </div>

      <div className="flex items-center mb-2">
        <label className="w-1/3 font-semibold">Node Type:</label>
        <input
          type="text"
          value={nodeType} // 禁用修改
          disabled
          className="p-2 border border-gray-300 rounded w-2/3 bg-gray-100"
        />
      </div>

      {nodeType !== "BIGCHECK" && (
        <div className="flex items-center mb-2">
          <label className="w-1/3 font-semibold">Max Level:</label>
          <input
            type="number"
            placeholder="Max Level"
            value={maxLevel}
            onChange={(e) => setMaxLevel(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded w-2/3"
          />
        </div>
      )}

      <div className="flex items-center mb-2">
        <label className="w-1/3 font-semibold">Icon:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setIconFile(e.target.files[0]); // 设置选择的图片文件
            }
          }}
          className="p-2 border border-gray-300 rounded w-2/3"
        />
      </div>

      {formType === "create" && nodeType !== "BIGCHECK" && (
        <div>
          <div className="flex items-center mb-2">
            <label className="w-1/3 font-semibold">Unlock Dependencies:</label>
            <select
              multiple
              className="p-2 border border-gray-300 rounded w-2/3"
              value={selectedUnlockNodes}
              onChange={(e) =>
                setSelectedUnlockNodes(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {unlockDepNodes.map((node: any) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mb-2">
            <label className="w-1/3 font-semibold">Lock Dependencies:</label>
            <select
              multiple
              className="p-2 border border-gray-300 rounded w-2/3"
              value={selectedLockNodes}
              onChange={(e) =>
                setSelectedLockNodes(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {lockDepNodes.map((node: any) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 编辑模式下的锁定依赖选择 */}
      {formType === "edit" && nodeType !== "BIGCHECK" && (
        <div className="flex items-center mb-2">
          <label className="w-1/3 font-semibold">Lock Dependencies:</label>
          <select
            multiple
            className="p-2 border border-gray-300 rounded w-2/3"
            value={selectedLockNodes}
            onChange={(e) =>
              setSelectedLockNodes(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
          >
            {mergedLockDepNodes.map((node: any) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default NodeForm;
