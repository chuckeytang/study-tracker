import React from "react";
import classNames from "classnames";

interface WidgetListProps {
  className?: string;
  children: React.ReactNode;
}

const WidgetList: React.FC<WidgetListProps> = ({ className, children }) => {
  const listBaseStyles = "flex flex-col gap-3";
  const defaultMargin = "mx-4";

  const combinedClassName = classNames(listBaseStyles, className, {
    [defaultMargin]: !className?.includes("mx-"),
  });

  const combinedDefaultMargin = classNames(defaultMargin, className);

  return <div className={combinedClassName}>{children}</div>;
};

export default WidgetList;
