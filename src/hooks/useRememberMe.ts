// [+] 新增 src/hooks/useRememberMe.ts
import { useState, useEffect } from "react";

export function useRememberMe() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // [+] 新增：组件挂载时，尝试从本地缓存读取账号密码
  useEffect(() => {
    const savedEmail = localStorage.getItem("trackahabit_email");
    const savedPassword = localStorage.getItem("trackahabit_password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // [+] 新增：封装保存/清理凭证的方法，供点击登录时调用
  const saveCredentials = () => {
    if (rememberMe) {
      localStorage.setItem("trackahabit_email", email);
      // 注意：实际生产中密码通常不建议明文存 localStorage，这里为了还原需求先做基础存储
      localStorage.setItem("trackahabit_password", password);
    } else {
      localStorage.removeItem("trackahabit_email");
      localStorage.removeItem("trackahabit_password");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    saveCredentials,
  };
}