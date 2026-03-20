import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmailInput from "@/components/ui/EmailInput";
import { apiRequest } from "@/utils/api";
import { showAuthSuccessToast } from "@/utils/showAuthSuccessToast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: 验证码, 2: 设置新密码
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPassLengthValid = password.length >= 6 && password.length <= 15;
  const isPassContentValid = /[A-Za-z]/.test(password) && /\d/.test(password);
  const isStep1Valid = isEmailValid && code.trim().length > 0;
  const isStep2Valid = isPassLengthValid && isPassContentValid;

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  const handleSendCode = () => {
    if (countdown > 0 || !isEmailValid || isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    apiRequest(
      "/api/auth/send-code",
      "POST",
      { email, type: "forgot-password" },
      true
    )
      .then(() => {
        setCountdown(60);
      })
      .catch((error: any) => {
        const msg =
          error?.data?.message || error?.message || "Failed to send code";
        setError(msg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleNext = () => {
    if (!isStep1Valid || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setStep(2);
    setIsSubmitting(false);
  };

  const handleConfirmReset = async () => {
    if (!isStep2Valid || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      await apiRequest(
        "/api/auth/reset-password",
        "POST",
        {
          email,
          code: code.trim(),
          newPassword: password,
        },
        true
      );
      showAuthSuccessToast("Success", 1500);
      setTimeout(() => { 
        router.push("/"); 
      }, 1500);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Reset failed";
      setError(msg);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#4880FF] flex items-center justify-center p-4 font-nunito">
      <Head>
        <title>Trackahabit | Reset Password</title>
      </Head>

      <style jsx global>{`
        /* [*] 核心优化：输入框基础样式（影响 Placeholder） */
        input {
          font-family: "Nunito Sans", sans-serif !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          letter-spacing: -0.064px !important;
          line-height: normal !important;
          font-style: normal !important;
        }

        /* 占位符颜色 */
        input::placeholder {
          color: #A6A6A6 !important;
        }

        /* [*] 核心优化：仅在有内容时切换为大圆点样式，解决“过宽”不和谐问题 */
        input[type="password"]:not(:placeholder-shown) {
          -webkit-text-security: disc !important;
          font-size: 24px !important;
          letter-spacing: 12px !important;
          color: #303236 !important;
        }

        .reset-title { color: #000; font-family: "SF Pro", sans-serif; font-size: 28px; font-weight: 590; }
        .reset-subtitle { color: #202224; font-family: "Nunito Sans", sans-serif; font-size: 18px; font-weight: 600; opacity: 0.8; letter-spacing: -0.064px; }
        .input-label-sf { color: #000; font-family: "SF Pro", sans-serif; font-size: 18px; font-weight: 510; opacity: 0.8; }
        .input-label-nunito { color: #202224; font-family: "Nunito Sans", sans-serif; font-size: 18px; font-weight: 600; opacity: 0.8; letter-spacing: -0.064px; }
        .send-code-text { color: #5A8CFF; font-family: "Nunito Sans", sans-serif; font-size: 18px; font-weight: 700; text-decoration: underline; cursor: pointer; min-width: 120px; text-align: right; }
        .input-error-fix { border: 1.5px solid #FF2121 !important; border-radius: 8px !important; outline: none !important; box-shadow: none !important; }
        div, input { --tw-ring-shadow: none !important; --tw-ring-offset-shadow: none !important; }
      `}</style>

      <main className="bg-white rounded-[24px] border-[0.3px] border-[#B9B9B9] w-full max-w-[630px] h-[735.362px] flex flex-col justify-center shadow-sm">
        <div className="w-full flex flex-col items-center px-[52px]">
          
          <div className="w-full max-w-[516px] text-left">
            <h1 className="reset-title mb-2">Reset Password</h1>
            <div className="reset-subtitle mb-[40px]">
              <p>You can reset your password once every 24 hours.</p>
              <p>The new password will be sent to your current email.</p>
            </div>
          </div>

          {/* Step 1: 验证码视图 */}
          {step === 1 && (
            <div className="w-full max-w-[516px]">
              <div className="mb-[30px]">
                <label className="input-label-nunito mb-2 block">Please confirm the account to recover</label>
                <EmailInput value={email} onChange={(val) => setEmail(val)} placeholder="Enter Email" hasClearButton />
              </div>

              <div className="mb-[50px]">
                <label className="input-label-sf mb-2 block">Enter email verification code</label>
                <div className="flex items-center justify-between">
                  <div className="w-[383px]">
                    <Input 
                      value={code} 
                      onChange={(e) => { setCode(e.target.value); if(error) setError(""); }} 
                      placeholder="Enter email verification code" 
                      className={error ? "input-error-fix" : ""}
                    />
                  </div>
                  <button type="button" className="send-code-text" onClick={handleSendCode} disabled={countdown > 0 || !isEmailValid || isSubmitting}>
                    {countdown > 0 ? `resend (${countdown}s)` : "Send code"}
                  </button>
                </div>
                {error && <p className="mt-2 text-[#FF2121] text-[14px] font-normal" style={{ fontFamily: '"SF Pro", sans-serif' }}>{error}</p>}
              </div>

              <Button onClick={handleNext} disabled={!isStep1Valid || isSubmitting}
                style={{ width: '418px', height: '56px', background: isStep1Valid ? '#4880FF' : 'rgba(72, 128, 255, 0.60)', borderRadius: '8px', margin: '0 auto', display: 'flex' }}
                className="text-[18px] font-semibold mb-[20px]"
              >
                {isSubmitting ? "Checking..." : "Next"}
              </Button>
            </div>
          )}

          {/* Step 2: 重置密码视图 */}
          {step === 2 && (
            <div className="w-full max-w-[516px]">
              <div className="mb-[24px]">
                <label className="input-label-sf mb-2 block">Enter a valid password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  isPassword 
                  isError={password.length > 0 && (!isPassLengthValid || !isPassContentValid)}
                  className={password.length > 0 && (!isPassLengthValid || !isPassContentValid) ? "input-error-fix" : ""}
                  placeholder="Enter password"
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
                      <span style={{ color: req.valid || password.length === 0 ? '#303236' : '#FF3C5A', fontFamily: '"SF Pro", sans-serif', fontSize: '16px', fontWeight: 400 }}>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleConfirmReset} disabled={!isStep2Valid || isSubmitting}
                style={{ width: '418px', height: '56px', background: isStep2Valid ? '#4880FF' : 'rgba(72, 128, 255, 0.60)', borderRadius: '8px', margin: '40px auto 20px', display: 'flex' }}
                className="text-[18px] font-semibold"
              >
                {isSubmitting ? "Processing..." : "Confirm Reset"}
              </Button>
            </div>
          )}

          <div className="text-center text-[16px] text-[#202224] font-semibold">
            <span className="opacity-[0.65]">Already have an account? </span>
            <button type="button" onClick={() => router.push("/")} className="text-[#5A8CFF] text-[18px] font-bold underline ml-1">Log in</button>
          </div>
        </div>
      </main>
    </div>
  );
}
