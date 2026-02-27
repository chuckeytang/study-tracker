// src/pages/index.tsx
import Head from "next/head";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import { useRememberMe } from "@/hooks/useRememberMe";
import EmailInput from "@/components/ui/EmailInput";

export default function Home() {
  const { 
    email, setEmail, 
    password, setPassword, 
    rememberMe, setRememberMe, 
    saveCredentials 
  } = useRememberMe();

  const [ emailError,setEmailError ] = useState("");

  const validateEmail = (val: string) => {
    if (!val){
      setEmailError("");
      return false;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!isValid) {
      setEmailError("Please enter a valid email address");
    }else{
      setEmailError("");
    }
  };

  const handleLogin = () => {
    validateEmail(email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("验证未通过，不执行登录");
      return;
    }
    saveCredentials();
    console.log("执行登录, Email:", email);
  };

  return (
    <div className="min-h-screen bg-[#4880FF] flex items-center justify-center p-4 font-nunito">
      <Head>
        <title>Trackahabit | Login</title>
      </Head>

      <main className="bg-white rounded-[24px] border-[0.3px] border-[#B9B9B9] w-full max-w-[630px] h-[735.362px] flex flex-col justify-center shadow-sm">
        
        <div className="w-full flex flex-col items-center px-[52px]">
          
          <div className="w-full max-w-[516px] text-left">
            <h1 className="text-[#202224] text-[32px] font-bold tracking-[-0.114px] mb-2">
              Login to Trackahabit
            </h1>
            {/* [*] 修改 增加 opacity-80 */}
            <p className="text-[#202224] text-[18px] font-semibold tracking-[-0.064px] mb-[40px] opacity-80">
              Please enter your email and password to continue
            </p>
          </div>

          <div className="mb-[30px] w-full max-w-[516px]">
            {/* [*] 修改 增加 opacity-80 */}
            <label className="text-[#202224] text-[14px] font-semibold mb-2 block opacity-80">Log in with email</label>
            <EmailInput 
              value={email} 
              onChange={(val) => setEmail(val)} 
              hasClearButton 
            />
          </div>

          <div className="mb-[24px] w-full max-w-[516px]">
            <div className="flex justify-between items-center mb-2">
              {/* [*] 修改 增加 opacity-80 */}
              <label className="text-[#202224] text-[14px] font-semibold opacity-80">Password</label>
              {/* [*] 修改 增加 opacity-60，同时加了一个 hover 恢复 100% 的小过渡效果，提升交互体验 */}
              <button className="text-[#202224] text-[18px] font-semibold tracking-[-0.064px] hover:text-[#4880FF] opacity-60 hover:opacity-100 transition-opacity">
                Forget Password?
              </button>
            </div>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              isPassword 
            />
          </div>

          <div className="mb-[40px] w-full max-w-[516px]">
            <Checkbox 
              checked={rememberMe} 
              onChange={() => setRememberMe(!rememberMe)} 
              label="Remember Password" 
            />
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full max-w-[418px] h-[56px] text-[18px] mb-[30px]"
          >
            Log In
          </Button>

          <div className="text-center text-[16px] text-[#202224] font-semibold">
            {/* [*] 修改 使用 span 单独包裹文本，增加 opacity-[0.65] 的任意值类名 */}
            <span className="opacity-[0.65]">Don't have an account? </span>
            <button className="text-[#5A8CFF] text-[18px] font-bold underline ml-1">
              Create Account
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}