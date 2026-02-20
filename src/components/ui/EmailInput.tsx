// src/components/ui/EmailInput.tsx
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import Input from "./Input";

const COMMON_EMAIL_DOMAINS = ["gmail.com", "outlook.com", "yahoo.com", "qq.com", "163.com"];

// [*] 修改 补充 error 相关属性
interface EmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  hasClearButton?: boolean;
  isError?: boolean;     // [+] 新增 接收外部的错误状态
  errorMessage?: string; // [+] 新增 接收错误文案
}

export default function EmailInput({ 
  value, 
  onChange, 
  hasClearButton, 
  isError,               // [+] 新增
  errorMessage,          // [+] 新增
  className = "", 
  ...props 
}: EmailInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (!val || val.includes(" ")) {
      setSuggestions([]);
      return;
    }

    const [prefix, domain] = val.split("@");
    let matchedDomains = domain !== undefined 
      ? COMMON_EMAIL_DOMAINS.filter(d => d.startsWith(domain.toLowerCase()))
      : COMMON_EMAIL_DOMAINS;

    const currentSuggestions = matchedDomains.slice(0, 3).map(d => `${prefix}@${d}`);
    
    if (currentSuggestions.length === 1 && currentSuggestions[0] === val) {
      setSuggestions([]);
    } else {
      setSuggestions(currentSuggestions);
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        type="email"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        hasClearButton={hasClearButton}
        onClear={() => onChange("")}
        isError={isError} // [+] 新增 传递错误状态给底层 Input
        className={className}
        {...props}
      />

      {/* [*] 修改 优化联想框位置，改为 top-[60px] 从下方弹出，避免遮盖顶部文字 */}
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute right-0 top-[60px] w-[370px] h-[137px] p-[25px_22px] flex flex-col justify-between items-start bg-white rounded-lg shadow-[0_2px_10px_0_rgba(0,0,0,0.20)] z-50 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onMouseDown={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full text-left cursor-pointer transition-colors text-[16px] leading-normal ${
                activeIndex === index ? "text-[#4880FF] font-bold" : "text-[#202224] font-semibold"
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* [+] 新增 严格按照 SF Pro 和 #FF2121 渲染的错误信息 */}
      {isError && errorMessage && (
        <span 
          className="block mt-[10px] text-[#FF2121] text-[14px] font-normal leading-normal absolute top-[56px] left-0"
          style={{ fontFamily: '"SF Pro", sans-serif' }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}