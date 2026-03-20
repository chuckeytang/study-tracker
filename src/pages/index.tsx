import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import { useRememberMe } from "@/hooks/useRememberMe";
import EmailInput from "@/components/ui/EmailInput";
import { apiRequest } from "@/utils/api";
import WebUser from "@/utils/user";
import { showAuthSuccessToast } from "@/utils/showAuthSuccessToast";

export default function Home() {
  const router = useRouter();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    saveCredentials,
  } = useRememberMe();

  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const validateEmail = (val: string): boolean => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!isValid) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleLogin = async () => {
    setLoginError("");
    setPasswordError(false);

    if (!validateEmail(email)) return;
    if (!password) {
      setLoginError("Both fields are required");
      setPasswordError(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await apiRequest("/api/system/login", "POST", { email, password }, true);

      if (!data?.token) {
        setLoginError("Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      saveCredentials();
      WebUser.getInstance().markAsExpired();
      const targetPath = "/selection";

      showAuthSuccessToast();
      redirectTimerRef.current = setTimeout(() => {
        router.push(targetPath);
      }, 1200);
    } catch (error: any) {
      const serverMessage = error?.data?.message || error?.message || "Login failed.";
      setLoginError(serverMessage);
      if (error?.status === 401) setPasswordError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#4880FF] flex items-center justify-center p-4 font-nunito">
      <Head>
        <title>Trackahabit | Login</title>
      </Head>

      {/* [+] 新增：全局样式注入，处理密码圆点和红框修复 */}
      <style jsx global>{`
        /* 密码圆点样式优化 */
        input[type="password"] {
          -webkit-text-security: disc !important;
          color: #303236 !important;
          font-size: 24px !important;
          letter-spacing: 12px !important;
        }
        /* 修复红框缺角 */
        .input-error-fix {
          border: 1.5px solid #FF2121 !important;
          border-radius: 8px !important;
          outline: none !important;
          box-shadow: none !important;
          background-clip: padding-box;
        }
        div, input {
          --tw-ring-shadow: none !important;
          --tw-ring-offset-shadow: none !important;
        }
      `}</style>

      {/* [*] 修改：容器尺寸对齐 630px x 735.362px */}
      <main className="bg-white rounded-[24px] border-[0.3px] border-[#B9B9B9] w-full max-w-[630px] h-[735.362px] flex flex-col justify-center shadow-sm">
        <div className="w-full flex flex-col items-center px-[52px]">
          
          {/* [*] 修改：标题样式对齐 Reset Password 风格 */}
          <div className="w-full max-w-[516px] text-left">
            <h1 className="text-[#000] text-[32px] font-bold tracking-[-0.114px] mb-2" style={{ fontFamily: '"SF Pro", sans-serif' }}>
              Login to Trackahabit
            </h1>
            <p className="text-[#202224] text-[18px] font-semibold tracking-[-0.064px] mb-[40px] opacity-80" style={{ fontFamily: '"Nunito Sans", sans-serif' }}>
              Please enter your email and password to continue
            </p>
          </div>

          {/* Email 输入区域 */}
          <div className="mb-[30px] w-full max-w-[516px]">
            <label className="text-[#202224] text-[18px] font-semibold mb-2 block opacity-80" style={{ fontFamily: '"Nunito Sans", sans-serif' }}>
              Log in with email
            </label>
            <EmailInput
              value={email}
              onChange={(val) => {
                setEmail(val);
                if (emailError) validateEmail(val);
              }}
              onBlur={() => validateEmail(email)}
              hasClearButton
              isError={!!emailError}
              className={!!emailError ? "input-error-fix" : ""}
            />
            {emailError && (
              <p className="mt-2 text-[#FF2121] text-[14px] font-normal" style={{ fontFamily: '"SF Pro", sans-serif' }}>
                {emailError}
              </p>
            )}
          </div>

          {/* Password 输入区域 */}
          <div className="mb-[24px] w-full max-w-[516px]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[#202224] text-[18px] font-semibold opacity-80" style={{ fontFamily: '"SF Pro", sans-serif' }}>
                Password
              </label>
              {/* [*] 修改：点击跳转至重置密码页面 */}
              <button 
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-[#202224] text-[18px] font-semibold tracking-[-0.064px] hover:text-[#4880FF] opacity-60 hover:opacity-100 transition-opacity"
              >
                Forget Password?
              </button>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(false);
              }}
              isPassword
              isError={passwordError}
              className={passwordError ? "input-error-fix" : ""}
            />
          </div>

          {/* Remember Password */}
          <div className="mb-[40px] w-full max-w-[516px]">
            <Checkbox
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              label="Remember Password"
            />
          </div>

          {/* [*] 修改：主按钮颜色逻辑对齐 */}
          <Button
            onClick={handleLogin}
            disabled={isSubmitting}
            style={{
              background: (email && password && !emailError) ? '#4880FF' : 'rgba(72, 128, 255, 0.60)',
              width: '418px',
              height: '56px'
            }}
            className="text-[18px] font-semibold mb-[20px] disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </Button>

          {loginError && (
            <p className="mb-[10px] text-[#FF2121] text-[14px] font-normal" style={{ fontFamily: '"SF Pro", sans-serif' }}>
              {loginError}
            </p>
          )}

          <div className="text-center text-[16px] text-[#202224] font-semibold">
            <span className="opacity-[0.65]">Don't have an account? </span>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-[#5A8CFF] text-[18px] font-bold underline ml-1"
            >
              Create Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
