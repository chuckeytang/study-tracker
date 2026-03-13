import { ChangeEvent, useState } from "react";
import { ClearIcon, EyeOffIcon } from "./Icons";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  hasClearButton?: boolean;
  onClear?: () => void;
  isPassword?: boolean;
  isError?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  hasClearButton,
  onClear,
  isPassword,
  isError = false,
  value,
  onChange,
  className = "",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword
    ? showPassword
      ? "text"
      : "password"
    : props.type || "text";

  return (
    <div
      className={`relative flex items-center w-full h-[56px] rounded-lg transition-colors ${
        isError ? "bg-[#F1F4F9] border" : "bg-gray-50 border border-gray-200"
      }`}
      style={
        isError
          ? { border: "1px solid var(--APP-Primary-Red, #FF3C5A)" }
          : undefined
      }
    >
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        className={`w-full h-full bg-transparent outline-none px-[26px] text-[#202224] ${
          isPassword ? "text-[18px] tracking-[0.2em]" : "text-[16px]"
        } ${className}`}
        {...props}
      />

      {hasClearButton && value && String(value).length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-[20px] top-[18px] hover:opacity-80 transition-opacity z-10"
        >
          <ClearIcon />
        </button>
      )}

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-[20px] top-[18px] hover:opacity-80 transition-opacity z-10"
        >
          <EyeOffIcon />
        </button>
      )}
    </div>
  );
}
