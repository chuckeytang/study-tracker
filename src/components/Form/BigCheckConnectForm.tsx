// components/Forms/BigCheckForm.tsx
import React, { useState, useEffect } from "react";

const BigCheckForm: React.FC<{
  nodeId: number;
  onClose: () => void;
  onSubmit: (selectedBigCheckId: number) => void;
}> = ({ nodeId, onClose, onSubmit }) => {
  const [availableBigChecks, setAvailableBigChecks] = useState<any[]>([]);
  const [selectedBigCheckId, setSelectedBigCheckId] = useState<number | null>(
    null
  );

  // 获取可用的 BigCheck 节点列表
  useEffect(() => {
    fetch(`/api/teacher/getUnlockBigCheckList?nodeId=${nodeId}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableBigChecks(data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching unlock BigCheck nodes:", error);
      });
  }, [nodeId]);

  // 表单提交
  const handleSubmit = () => {
    if (selectedBigCheckId) {
      onSubmit(selectedBigCheckId); // 调用父组件的 onSubmit 函数
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
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

export default BigCheckForm;
