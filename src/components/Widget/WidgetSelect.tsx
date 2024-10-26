import React from "react";
import classNames from "classnames";

interface Option {
  label: string;
  icon?: React.ReactNode;
  value: any; // 添加 value 属性
}

interface WidgetSelectProps {
  options: Option[];
  className?: string;
  onChange?: (selectedValue: any) => void; // 添加 onChange 属性
}

const WidgetSelect: React.FC<WidgetSelectProps> = ({
  options,
  className,
  onChange,
}) => {
  return (
    <div className={classNames("relative", className)}>
      <select
        className="input w-full rounded-full bg-white text-black pl-10 h-10"
        onChange={(e) => onChange && onChange(e.target.value)} // 调用 onChange
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute bottom-1 left-0 w-8 h-8 flex items-center pl-3">
        {options[0]?.icon}
      </div>
    </div>
  );
};

export default WidgetSelect;
