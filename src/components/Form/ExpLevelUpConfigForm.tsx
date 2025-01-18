import React, { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";

interface ExpLevelUpConfigFormProps {
  onClose: () => void;
  onSubmit: (config: number[]) => void;
}

const ExpLevelUpConfigForm: React.FC<ExpLevelUpConfigFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [expConfig, setExpConfig] = useState<number[]>(Array(7).fill(0));

  useEffect(() => {
    const fetchExperienceConfig = async () => {
      try {
        const data = await apiRequest("/api/teacher/config/getExperience");
        const config = data.map((item: any) => item.expPoints);
        
        // Ensure the config array is exactly 7 levels long
        const filledConfig = Array(7).fill(0).map((_, index) => config[index] || 0);
        setExpConfig(filledConfig);
      } catch (error) {
        console.error("Error fetching experience configuration:", error);
      }
    };

    fetchExperienceConfig();
  }, []);

  const handleChange = (index: number, value: string) => {
    const newConfig = [...expConfig];
    newConfig[index] = parseInt(value, 10) || 0;
    setExpConfig(newConfig);
  };

  const handleSubmit = () => {
    onSubmit(expConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-4">Configure Experience Levels</h2>
        {expConfig.map((value, index) => (
          <div key={index} className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Level {index + 1} Experience Points:
            </label>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
            />
          </div>
        ))}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpLevelUpConfigForm;
