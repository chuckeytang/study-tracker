import React, { HTMLInputTypeAttribute } from "react";
import classNames from "classnames";

interface WidgetInputProps {
  type: HTMLInputTypeAttribute;
  placeholder: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  required?: boolean | undefined;
}

const WidgetInput: React.FC<WidgetInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  onKeyDown,
  className,
  required,
}) => {
  const baseStyles =
    "input w-full rounded-lg bg-white text-black h-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const combinedClassName = classNames(baseStyles, className);

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={combinedClassName}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      required={required}
    />
  );
};

export default WidgetInput;
