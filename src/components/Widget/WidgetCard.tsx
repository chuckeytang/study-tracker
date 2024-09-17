import React from "react";
import classNames from "classnames";

interface WidgetCardProps {
  className?: string;
  children: React.ReactNode;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ className, children }) => {
  const baseStyles = "bg-white rounded-2xl p-4 text-black flex";
  const combinedClassName = classNames(baseStyles, className);

  return <div className={combinedClassName}>{children}</div>;
};

export default WidgetCard;
