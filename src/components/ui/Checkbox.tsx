// src/components/ui/Checkbox.tsx
// [+] 新增 自定义样式的复选框组件
import { CheckSquareIcon, SquareIcon } from "./Icons";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export default function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <div 
      className="flex items-center cursor-pointer select-none group" 
      onClick={onChange}
    >
      <div className="mr-2 group-hover:opacity-80 transition-opacity">
        {checked ? <CheckSquareIcon /> : <SquareIcon />}
      </div>
      <span className="text-gray-500 text-[14px] font-semibold">
        {label}
      </span>
    </div>
  );
}

