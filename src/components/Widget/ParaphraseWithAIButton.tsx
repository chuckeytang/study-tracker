import { EditByAI } from "@/styles/icon";
import React from "react";

interface ParaphraseWithAIButtonProps {
  onClick: () => void;
}

const ParaphraseWithAIButton: React.FC<ParaphraseWithAIButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      className="flex items-center justify-center w-[170px] h-[29px] bg-[#F29938] rounded-full"
      onClick={onClick}
    >
      <EditByAI />
      <span className="text-white text-[14px] ml-2">Paraphrase with AI</span>
    </button>
  );
};

export default ParaphraseWithAIButton;
