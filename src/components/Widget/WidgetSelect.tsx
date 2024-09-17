import React from "react";
import classNames from "classnames";
import { HiOutlineChevronDown as DropDownIcon } from "react-icons/hi";

interface Option {
  label: string;
  icon: React.ReactNode;
}

interface WidgetSelectProps {
  options: Option[];
  className?: string;
}

const WidgetSelect: React.FC<WidgetSelectProps> = ({ options, className }) => {
  return (
    <div className={classNames("relative mb-4", className)}>
      <select className="input w-full rounded-full bg-white text-black pl-12 pr-12 h-10">
        {options.map((option, index) => (
          <option key={index}>{option.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        {options[0]?.icon}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <DropDownIcon className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );
};

export default WidgetSelect;
