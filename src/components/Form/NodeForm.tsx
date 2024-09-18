import React, { useState } from "react";

const NodeForm: React.FC<{
  onSubmit: (data: any) => void;
  defaultValue?: any;
}> = ({ onSubmit, defaultValue = {} }) => {
  const [name, setName] = useState(defaultValue.name || "");
  const [description, setDescription] = useState(
    defaultValue.description || ""
  );
  const [level, setLevel] = useState(defaultValue.level || 1);
  const [maxLevel, setMaxLevel] = useState(defaultValue.maxLevel || 5);

  const handleSubmit = () => {
    const nodeData = { name, description, level, maxLevel };
    onSubmit(nodeData);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-bold mb-2">Node Form</h2>
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
        placeholder="Level"
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <input
        type="number"
        placeholder="Max Level"
        value={maxLevel}
        onChange={(e) => setMaxLevel(Number(e.target.value))}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Submit
      </button>
    </div>
  );
};

export default NodeForm;
