import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmailInput from "@/components/ui/EmailInput";
import { apiRequest } from "@/utils/api";
import WebUser from "@/utils/user";

export default function RegisterPage() {
  const router = useRouter();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formKey, setFormKey] = useState(0);

  const [registerError, setRegisterError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // 校验逻辑
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPassLengthValid = password.length >= 6 && password.length <= 15;
  const isPassContentValid = /[A-Za-z]/.test(password) && /\d/.test(password);
  const isFormValid = isEmailValid && isPassLengthValid && isPassContentValid;

  useEffect(() => {
    setFormKey(prev => prev + 1);
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleRegister = async () => {
    if (!isFormValid || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const data = await apiRequest("/api/system/register", "POST", { email, password }, true);
      if (!data?.token) {
        setRegisterError(data?.message || "Registration failed");
        return;
      }
      localStorage.setItem("token", data.token);
      WebUser.getInstance().markAsExpired();
      setShowSuccessToast(true);
      redirectTimerRef.current = setTimeout(() => {
        router.push("/selection");
      }, 1200);
    } catch (error: any) {
      setRegisterError(error?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#4880FF] flex items-center justify-center p-4 font-nunito">
      <Head>
        <title>Trackahabit | Register</title>
      </Head>

      <style jsx global>{`
        /* [*] 统一输入框基础样式（包含 Placeholder 样式） */
        input {
          font-family: "Nunito Sans", sans-serif !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          letter-spacing: -0.064px !important;
        }

        input::placeholder {
          color: #A6A6A6 !important;
        }

        /* [*] 仅在有内容时切换为密码大圆点，确保 Placeholder 不被拉伸 */
        input[type="password"]:not(:placeholder-shown) {
          -webkit-text-security: disc !important;
          font-size: 24px !important;
          letter-spacing: 12px !important;
          color: #303236 !important;
        }

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

      <main className="bg-white rounded-[24px] border-[0.3px] border-[#B9B9B9] w-full max-w-[630px] h-[735.362px] flex flex-col justify-center shadow-sm">
        <div className="w-full flex flex-col items-center px-[52px]">
          
          <div className="w-full max-w-[516px] text-left">
            <h1 className="text-[#202224] text-[32px] font-bold tracking-[-0.114px] mb-2">
              Create Trackahabit Account
            </h1>
            <p className="text-[#202224] text-[18px] font-semibold tracking-[-0.064px] mb-[40px] opacity-80">
              Please enter your email and password to start
            </p>
          </div>

          {/* Email 输入框 */}
          <div className="mb-[24px] w-full max-w-[516px]">
            <label className="text-[#202224] text-[14px] font-semibold mb-2 block opacity-80">
              Sign up with email
            </label>
            <EmailInput
              key={`email-${formKey}`}
              value={email}
              onChange={(val) => setEmail(val)}
              placeholder="Enter Email" // [+] 添加了 Placeholder
              autoComplete="off"
              hasClearButton
              isError={email.length > 0 && !isEmailValid}
              className={email.length > 0 && !isEmailValid ? "input-error-fix" : ""}
            />
            {email.length > 0 && !isEmailValid && (
              <p className="mt-2 text-[#FF2121] text-[14px] font-normal" style={{ fontFamily: '"SF Pro", sans-serif' }}>
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Password 输入框 */}
          <div className="mb-[24px] w-full max-w-[516px]">
            <label className="text-[#202224] text-[14px] font-semibold mb-2 block opacity-80">
              Password
            </label>
            <Input
              key={`pass-${formKey}`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password" // [+] 添加了 Placeholder
              autoComplete="new-password"
              isPassword
              isError={password.length > 0 && (!isPassLengthValid || !isPassContentValid)}
              className={password.length > 0 && (!isPassLengthValid || !isPassContentValid) ? "input-error-fix" : ""}
            />

            <div className="mt-4 flex flex-col gap-2">
              {[
                { text: "6–15 characters", valid: isPassLengthValid },
                { text: "Must include both letters and numbers", valid: isPassContentValid }
              ].map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  {req.valid || password.length === 0 ? (
                    <div style={{ width: '4.5px', height: '4.5px', backgroundColor: '#565656', borderRadius: '50%', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M5.25 5.25L12.75 12.75" stroke="#FF2121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.25 12.75L12.75 5.25" stroke="#FF2121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <span style={{
                    color: req.valid || password.length === 0 ? '#303236' : '#FF3C5A',
                    fontFamily: '"SF Pro", sans-serif', fontSize: '16px', fontWeight: 400
                  }}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={!isFormValid || isSubmitting}
            style={{
              background: isFormValid ? '#4880FF' : 'rgba(72, 128, 255, 0.60)',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
            }}
            className="w-full max-w-[418px] h-[56px] text-[18px] mb-[20px]"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>

          {registerError && (
            <p className="mb-[10px] text-[#FF2121] text-[14px] text-center" style={{ fontFamily: '"SF Pro", sans-serif' }}>
              {registerError}
            </p>
          )}

          <div className="text-center text-[16px] text-[#202224] font-semibold">
            <span className="opacity-[0.65]">Already have an account? </span>
            <button
              onClick={() => router.push("/")}
              className="text-[#5A8CFF] text-[18px] font-bold underline ml-1"
            >
              Log In
            </button>
          </div>
        </div>
      </main>

      {/* Success Toast 部分 */}
      {showSuccessToast && (
        <div className="fixed top-[24px] right-[24px] z-[1000]">
          <div className="rounded-[16px] shadow-[0_6px_20px_rgba(0,0,0,0.18)] flex flex-col justify-center items-center gap-[10px]"
            style={{ width: "250px", height: "79px", background: "#D7E4FF" }}>
            <div className="flex items-center gap-[10px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M15.9998 29.3334C19.6817 29.3334 23.015 27.841 25.4279 25.4281C27.8408 23.0153 29.3332 19.6819 29.3332 16.0001C29.3332 12.3182 27.8408 8.98488 25.4279 6.57199C23.015 4.15913 19.6817 2.66675 15.9998 2.66675C12.318 2.66675 8.98464 4.15913 6.57174 6.57199C4.15889 8.98488 2.6665 12.3182 2.6665 16.0001C2.6665 19.6819 4.15889 23.0153 6.57174 25.4281C8.98464 27.841 12.318 29.3334 15.9998 29.3334Z" stroke="#303236" strokeWidth="3" />
                <path d="M10.6665 16L14.6665 20L22.6665 12" stroke="#303236" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: "#303236", fontFamily: '"SF Pro", sans-serif', fontSize: "28px", fontWeight: 510 }}>Success</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}