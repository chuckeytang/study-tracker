import React from "react";
import classNames from "classnames";

interface WidgetTextAreaProps {
  placeholder: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  className?: string;
}

const WidgetTextArea = React.forwardRef<
  HTMLTextAreaElement,
  WidgetTextAreaProps
>(({ placeholder, value, onChange, onKeyDown, className }, ref) => {
  const baseStyles = "w-full p-4 text-black";
  const defaultHeight = "h-[234px]";
  const defaultBgColor = "bg-white";
  const defaultRounded = "rounded-xl";

  const combinedClassName = classNames(
    baseStyles,
    {
      [defaultHeight]: !className?.includes("h-"),
      [defaultBgColor]: !className?.includes("bg-"),
      [defaultRounded]: !className?.includes("rounded-"),
    },
    className
  );

  return (
    <textarea
      placeholder={placeholder}
      className={combinedClassName}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      ref={ref}
    />
  );
});

export default WidgetTextArea;
