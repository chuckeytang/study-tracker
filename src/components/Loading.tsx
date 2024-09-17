import React, { FC } from "react";

interface ILoading {
  className?: string;

  text?: string;
}

const Loading: FC<ILoading> = ({ className, text }) => {
  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center ${className}`}
    >
      <div className="loading loading-ring loading-lg"></div>
      <div className="m-5">{text}</div>
    </div>
  );
};

export default Loading;
