import React from "react";
import classNames from "classnames";

export const StepNotStarted = () => (
  <svg
    width="38"
    height="39"
    viewBox="0 0 38 39"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="34" height="35" rx="17" fill="white" />
    <rect
      x="2"
      y="2"
      width="34"
      height="35"
      rx="17"
      stroke="#C7C7C7"
      strokeWidth="4"
    />
    <circle cx="19.5" cy="19.5" r="4.5" fill="#C7C7C7" />
  </svg>
);

export const StepInProgress = () => (
  <svg
    width="38"
    height="39"
    viewBox="0 0 38 39"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="34" height="35" rx="17" fill="white" />
    <rect
      x="2"
      y="2"
      width="34"
      height="35"
      rx="17"
      stroke="#00D632"
      strokeWidth="4"
    />
    <circle cx="19.5" cy="19.5" r="4.5" fill="#00D632" />
  </svg>
);

export const StepCompleted = () => (
  <svg
    width="38"
    height="39"
    viewBox="0 0 38 39"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="34" height="35" rx="17" fill="white" />
    <rect
      x="2"
      y="2"
      width="34"
      height="35"
      rx="17"
      stroke="#00D632"
      strokeWidth="4"
    />
    <path
      d="M12 20.2097L16.077 24.2867C16.1954 24.4051 16.3868 24.4066 16.507 24.2901L26.0968 15"
      stroke="#00D632"
      strokeWidth="2.45161"
      strokeLinecap="round"
    />
  </svg>
);

const getLineColor = (currentStep: number, nextStep: number) => {
  return currentStep >= nextStep ? "border-green-500" : "border-gray-300";
};

interface WidgetStepProgressProps {
  step: number;
  steps: number[];
  renderStepContent: (step: number) => React.ReactNode;
}

const WidgetStepProgress: React.FC<WidgetStepProgressProps> = ({
  step,
  steps,
  renderStepContent,
}) => {
  return (
    <div className="bg-gray-100 p-4 pb-40">
      <div className="flex justify-center items-center mb-4">
        {steps.map((s, index) => (
          <React.Fragment key={index}>
            {step > s ? (
              <StepCompleted />
            ) : step === s ? (
              <StepInProgress />
            ) : (
              <StepNotStarted />
            )}
            {index < steps.length - 1 && (
              <div
                className={`w-10 h-0 ${getLineColor(
                  s,
                  s + 1
                )} border-t border-dashed`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
      {renderStepContent(step)}
    </div>
  );
};

export default WidgetStepProgress;
