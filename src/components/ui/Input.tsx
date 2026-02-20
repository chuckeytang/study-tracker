// src/components/ui/Input.tsx
// [+] 新增 统一的高复用输入框组件
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { ClearIcon, EyeOffIcon } from "./Icons";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    hasClearButton?: boolean;
    onClear?: () => void;
    isPassword?: boolean;
    isError?: boolean; // [+] 新增 错误状态标识
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
  ...props // 这里就是接收原生 onChange, placeholder 等属性的地方
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  // 决定当前 input 渲染什么类型
  const inputType = isPassword ? (showPassword ? "text" : "password") : props.type || "text";

  return (
    <div className={`relative flex items-center w-full h-[56px] rounded-lg transition-colors ${
        isError 
          ? "bg-[#F1F4F9] border border-[#FF3C5A]" 
          : "bg-gray-50 border border-gray-200"
      }`}>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          className={`w-full h-full bg-transparent outline-none px-[26px] text-[#202224] ${isPassword ? 'text-[18px] tracking-[0.2em]' : 'text-[16px]'} ${className}`}
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