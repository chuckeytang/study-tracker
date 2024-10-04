import React, { useEffect, useState } from "react";

const NodeForm: React.FC<{
  onSubmit: (data: any) => void;
  defaultValue?: any;
  nodeId: number;
}> = ({ onSubmit, defaultValue = {}, nodeId }) => {
  const [name, setName] = useState(defaultValue.name || "");
  const [description, setDescription] = useState(
    defaultValue.description || ""
  );
  const [nodeType, setNodeType] = useState(defaultValue.nodeType || "BIGCHECK");
  const [maxLevel, setMaxLevel] = useState(defaultValue.maxLevel || 1);
  const [iconUrl, setIconUrl] = useState(defaultValue.iconUrl || "");
  const [unlockDepNodeCount, setUnlockDepNodeCount] = useState(
    defaultValue.unlockDepNodeCount || null
  );
  const [lockDepNodeCount, setLockDepNodeCount] = useState(
    defaultValue.lockDepNodeCount || null
  );

  const [unlockDepNodes, setUnlockDepNodes] = useState([]); // 解锁依赖节点列表
  const [selectedUnlockNodes, setSelectedUnlockNodes] = useState<string[]>([]); // 解锁依赖节点选择

  const [lockDepNodes, setLockDepNodes] = useState([]); // 锁定依赖节点列表
  const [selectedLockNodes, setSelectedLockNodes] = useState<string[]>([]); // 锁定依赖节点选择

  // 获取解锁依赖节点列表
  useEffect(() => {
    fetch(`/api/teacher/getUnlockDepNodeList?nodeId=${nodeId}`)
      .then((res) => res.json())
      .then((data) => {
        setUnlockDepNodes(data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching unlock dependency nodes:", error);
      });
  }, [nodeId]);

  // 获取锁定依赖节点列表
  useEffect(() => {
    fetch(`/api/teacher/getLockDepNodeList?nodeId=${nodeId}`)
      .then((res) => res.json())
      .then((data) => {
        setLockDepNodes(data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching lock dependency nodes:", error);
      });
  }, [nodeId]);

  // 提交表单
  const handleSubmit = () => {
    const nodeData = {
      name,
      description,
      nodeType,
      maxLevel,
      iconUrl,
      unlockDepNodeCount,
      lockDepNodeCount,
      selectedUnlockNodes,
      selectedLockNodes,
    };
    onSubmit(nodeData);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col">
      <h2 className="text-lg font-bold mb-2">Node Form</h2>
      {/* 基本信息输入 */}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <input
        type="number"
        placeholder="Max Level"
        value={maxLevel}
        onChange={(e) => setMaxLevel(Number(e.target.value))}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Icon URL"
        value={iconUrl}
        onChange={(e) => setIconUrl(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />

      {/* 解锁依赖节点选择 */}
      <h3 className="text-md font-semibold mb-2">Select Dependent Courses</h3>
      <select
        multiple
        className="mb-2 p-2 border border-gray-300 rounded w-full"
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

      {/* 锁定依赖节点选择 */}
      <h3 className="text-md font-semibold mb-2">Select Lock Dependencies</h3>
      <select
        multiple
        className="mb-2 p-2 border border-gray-300 rounded w-full"
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

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded mt-4"
      >
        Submit
      </button>
    </div>
  );
};

export default NodeForm;
