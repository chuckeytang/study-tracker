// components/Forms/BigCheckConnectForm.tsx
import { apiRequest } from "@/utils/api";
import React, { useState, useEffect } from "react";

const BigCheckConnectForm: React.FC<{
  nodeId: number;
  onClose: () => void;
  onSubmit: (
    selectedBigCheckId: number,
    unlockDepNodeCount: number,
    unlockDepClusterTotalSkillPt: number,
    lockDepNodeCount: number
  ) => void;
  courseId: string;
}> = ({ nodeId, onClose, onSubmit, courseId }) => {
  const [availableBigChecks, setAvailableBigChecks] = useState<any[]>([]);
  const [selectedBigCheckId, setSelectedBigCheckId] = useState<number | null>(
    null
  );
  const [unlockDepNodeCount, setUnlockDepNodeCount] = useState<number>(0);
  const [unlockDepClusterTotalSkillPt, setUnlockDepClusterTotalSkillPt] =
    useState<number>(1);
  const [lockDepNodeCount, setLockDepNodeCount] = useState<number>(0);

  // 获取可用的 BigCheck 节点列表
  useEffect(() => {
    const fetchAvailableBigChecks = async () => {
      try {
        // 使用 apiRequest 发送请求
        const data = await apiRequest(
          `/api/teacher/getUnlockBigCheckList?courseId=${courseId}&nodeId=${nodeId}`
        );

        // 设置可用的 BigCheck 节点数据
        setAvailableBigChecks(data.data || []);
      } catch (error) {
        console.error("Error fetching unlock BigCheck nodes:", error);
      }
    };

    // 调用异步函数
    fetchAvailableBigChecks();
  }, [nodeId]);

  // 表单提交
  const handleSubmit = () => {
    if (selectedBigCheckId) {
      onSubmit(
        selectedBigCheckId,
        unlockDepNodeCount,
        unlockDepClusterTotalSkillPt,
        lockDepNodeCount
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative text-gray-800">
        <h2 className="text-lg font-bold mb-4">Connect to Other BigCheck</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Select BigCheck to connect:
          </label>
          <select
            value={selectedBigCheckId || ""}
            onChange={(e) => setSelectedBigCheckId(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select a BigCheck</option>
            {availableBigChecks.map((bigCheck) => (
              <option key={bigCheck.id} value={bigCheck.id}>
                {bigCheck.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Unlock Totle Skill Points:
          </label>
          <input
            type="number"
            value={unlockDepClusterTotalSkillPt}
            onChange={(e) =>
              setUnlockDepClusterTotalSkillPt(Number(e.target.value))
            }
            className="p-2 border border-gray-300 rounded w-full"
            min={1}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded mr-2"
            disabled={!selectedBigCheckId}
          >
            Connect
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BigCheckConnectForm;
