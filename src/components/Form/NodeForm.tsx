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
  const [coolDown, setCoolDown] = useState(defaultValue.coolDown / 60 || 0);
  const [unlockType, setUnlockType] = useState(
    defaultValue.unlockType || "SKILL_POINT"
  );
  const [unlockDepTimeInterval, setUnlockDepTimeInterval] = useState(
    defaultValue.unlockDepTimeInterval / 60 || 0
  );
  const [exp, setExp] = useState(defaultValue.exp || 0);
  const [rewardPt, setRewardPt] = useState(defaultValue.rewardPt || 0);
  const [unlockDepClusterTotalSkillPt, setUnlockDepClusterTotalSkillPt] =
    useState(defaultValue.unlockDepClusterTotalSkillPt || 0);

  const [unlockDepNodes, setUnlockDepNodes] = useState<any[]>([]); // 解锁依赖节点列表
  const [selectedUnlockNodes, setSelectedUnlockNodes] = useState<string[]>([]); // 解锁依赖节点选择

  const [lockDepNodes, setLockDepNodes] = useState<any[]>([]); // 锁定依赖节点列表
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
    if (
      formType === "create" &&
      unlockDepNodes.length > 0 &&
      selectedUnlockNodes.length === 0
    ) {
      setSelectedUnlockNodes([unlockDepNodes[0].id]); // 默认选择第一个
    }
  }, [unlockDepNodes]);

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
      coolDown: coolDown * 60,
      unlockType,
      unlockDepTimeInterval:
        unlockType === "TIME_BASED" ? unlockDepTimeInterval * 60 : undefined,
      exp,
      rewardPt,
      unlockDepClusterTotalSkillPt,
    };
    onSubmit(formType, nodeData);
  };

  // Toggle selection on click
  const handleToggleSelect = (nodeId: string, isUnlock: boolean) => {
    if (isUnlock) {
      setSelectedUnlockNodes((prev) => {
        if (prev.includes(nodeId) && prev.length === 1) {
          return prev; // 保持选中状态，不允许取消
        }
        return prev.includes(nodeId)
          ? prev.filter((id) => id !== nodeId)
          : [...prev, nodeId];
      });
    } else {
      setSelectedLockNodes((prev) =>
        prev.includes(nodeId)
          ? prev.filter((id) => id !== nodeId)
          : [...prev, nodeId]
      );
    }
  };

  // Determine unlock type options based on node type
  const unlockTypeOptions = () => {
    if (nodeType === "BIGCHECK") {
      return (
        <>
          <option value="TIME_BASED">Time Based</option>
          <option value="CLUSTER_TOTAL_SKILL_POINT">
            Cluster Total Skill Point
          </option>
        </>
      );
    } else {
      return (
        <>
          <option value="SKILL_POINT">Skill Point</option>
          <option value="TIME_BASED">Time Based</option>
        </>
      );
    }
  };

  // Check if the node is the first node (BIGCHECK with no dependencies)
  const isFirstNode =
    nodeType === "BIGCHECK" &&
    (!defaultValue.unlockDependencies ||
      defaultValue.unlockDependencies.length === 0);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col text-gray-800">
      <h2 className="text-lg font-bold mb-4">Node Form</h2>

      {/* 基本信息输入 */}
      <div className="flex items-center mb-2">
        <label className="w-1/3 font-semibold flex">
          <div className="text-red-600">*</div>Name:
        </label>
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

      {nodeType !== "BIGCHECK" && (
        <>
          <div className="flex items-center mb-2">
            <label className="w-1/3 font-semibold">
              Experience Points (EXP):
            </label>
            <input
              type="number"
              placeholder="Experience Points"
              value={exp}
              onChange={(e) => setExp(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded w-2/3"
            />
          </div>

          <div className="flex items-center mb-2">
            <label className="w-1/3 font-semibold">Reward Points:</label>
            <input
              type="number"
              placeholder="Reward Points"
              value={rewardPt}
              onChange={(e) => setRewardPt(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded w-2/3"
            />
          </div>
        </>
      )}

      {!isFirstNode && (
        <>
          <div className="flex items-center mb-2">
            <label className="w-1/3 font-semibold">Unlock Type:</label>
            <select
              value={unlockType}
              onChange={(e) => setUnlockType(e.target.value)}
              className="p-2 border border-gray-300 rounded w-2/3"
            >
              {unlockTypeOptions()}
            </select>
          </div>

          {unlockType === "TIME_BASED" && (
            <div className="flex items-center mb-2">
              <label className="w-1/3 font-semibold">
                Unlock Time Interval (mins):
              </label>
              <input
                type="number"
                placeholder="Unlock Time Interval in mins"
                value={unlockDepTimeInterval}
                onChange={(e) =>
                  setUnlockDepTimeInterval(Number(e.target.value))
                }
                className="p-2 border border-gray-300 rounded w-2/3"
              />
            </div>
          )}

          {unlockType === "CLUSTER_TOTAL_SKILL_POINT" && (
            <div className="flex items-center mb-2">
              <label className="w-1/3 font-semibold">
                Cluster Total Skill Points:
              </label>
              <input
                type="number"
                placeholder="Cluster Total Skill Points"
                value={unlockDepClusterTotalSkillPt}
                onChange={(e) =>
                  setUnlockDepClusterTotalSkillPt(Number(e.target.value))
                }
                className="p-2 border border-gray-300 rounded w-2/3"
              />
            </div>
          )}
        </>
      )}

      {nodeType !== "BIGCHECK" && unlockType === "SKILL_POINT" && (
        <div className="flex items-center mb-2">
          <label className="w-1/3 font-semibold">Cooldown (mins):</label>
          <input
            type="number"
            placeholder="Cooldown in mins"
            value={coolDown}
            onChange={(e) => setCoolDown(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded w-2/3"
          />
        </div>
      )}

      {formType === "create" && nodeType !== "BIGCHECK" && (
        <div>
          <div className="flex items-center mb-2">
            <label className="w-1/3 font-semibold">Unlock Dependencies:</label>
            <ul className="p-2 border border-gray-300 rounded w-2/3 bg-white">
              {unlockDepNodes.map((node: any) => (
                <li
                  key={node.id}
                  className={`p-2 cursor-pointer ${
                    selectedUnlockNodes.includes(node.id) ? "bg-blue-200" : ""
                  }`}
                  onClick={() => handleToggleSelect(node.id, true)}
                >
                  {node.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center mb-2">
            <label className="w-1/3 font-semibold">Lock Dependencies:</label>
            <ul className="p-2 border border-gray-300 rounded w-2/3 bg-white">
              {lockDepNodes.map((node: any) => (
                <li
                  key={node.id}
                  className={`p-2 cursor-pointer ${
                    selectedLockNodes.includes(node.id) ? "bg-blue-200" : ""
                  }`}
                  onClick={() => handleToggleSelect(node.id, false)}
                >
                  {node.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
            {lockDepNodes.map((node: any) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
