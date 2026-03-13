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
  const [showSuccessToast, setShowSuccessToast] = useState(false);
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

    if (!validateEmail(email)) {
      return;
    }

    if (!password) {
      setLoginError("Both fields are required");
      setPasswordError(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await apiRequest(
        "/api/system/login",
        "POST",
        { email, password },
        true
      );

      if (!data?.token) {
        setLoginError("Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      saveCredentials();
      WebUser.getInstance().markAsExpired();

      let targetPath = "/myCourses";
      if (data?.user?.role === "ADMIN") {
        targetPath = "/admin";
      } else if (!data?.user) {
        const userDetails = await WebUser.getInstance().getUserData();
        if (userDetails?.role === "ADMIN") {
          targetPath = "/admin";
        }
      }

      setShowSuccessToast(true);

      redirectTimerRef.current = setTimeout(() => {
        router.push(targetPath);
      }, 1200);
    } catch (error: any) {
      const serverMessage =
        error?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials.";
      setLoginError(serverMessage);
      setShowSuccessToast(false);
      if (error?.status === 401 || serverMessage === "Invalid email or password") {
        setPasswordError(true);
      }
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="text-[#202224] text-[18px] font-semibold tracking-[-0.064px] mb-[40px] opacity-80">
              Please enter your email and password to continue
            </p>
          </div>

          <div className="mb-[30px] w-full max-w-[516px]">
            <label className="text-[#202224] text-[14px] font-semibold mb-2 block opacity-80">
              Log in with email
            </label>
            <EmailInput
              value={email}
              onChange={(val) => {
                setEmail(val);
                if (emailError) {
                  validateEmail(val);
                }
              }}
              onBlur={() => validateEmail(email)}
              hasClearButton
              isError={!!emailError}
              errorMessage={emailError}
            />
          </div>

          <div className="mb-[24px] w-full max-w-[516px]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[#202224] text-[14px] font-semibold opacity-80">
                Password
              </label>
              <button className="text-[#202224] text-[18px] font-semibold tracking-[-0.064px] hover:text-[#4880FF] opacity-60 hover:opacity-100 transition-opacity">
                Forget Password?
              </button>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) {
                  setPasswordError(false);
                }
              }}
              isPassword
              isError={passwordError}
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
            disabled={isSubmitting}
            className="w-full max-w-[418px] h-[56px] text-[18px] mb-[20px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </Button>

          {loginError && (
            <p
              className="mb-[10px] text-[#FF2121] text-[14px] font-normal leading-normal"
              style={{ fontFamily: '"SF Pro", sans-serif' }}
            >
              {loginError}
            </p>
          )}

          <div className="text-center text-[16px] text-[#202224] font-semibold">
            <span className="opacity-[0.65]">Don't have an account? </span>
            <button
              onClick={() => router.push("/register")}
              className="text-[#5A8CFF] text-[18px] font-bold underline ml-1"
            >
              Create Account
            </button>
          </div>
        </div>
      </main>

      {showSuccessToast && (
        <div className="fixed top-[24px] right-[24px] z-[1000]">
          <div
            className="rounded-[16px] shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
            style={{
              display: "flex",
              width: "250px",
              height: "79px",
              padding: "8px 13px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              aspectRatio: "250/79",
              background: "#D7E4FF",
            }}
          >
            <div className="flex items-center justify-center gap-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M15.9998 29.3334C19.6817 29.3334 23.015 27.841 25.4279 25.4281C27.8408 23.0153 29.3332 19.6819 29.3332 16.0001C29.3332 12.3182 27.8408 8.98488 25.4279 6.57199C23.015 4.15913 19.6817 2.66675 15.9998 2.66675C12.318 2.66675 8.98464 4.15913 6.57174 6.57199C4.15889 8.98488 2.6665 12.3182 2.6665 16.0001C2.6665 19.6819 4.15889 23.0153 6.57174 25.4281C8.98464 27.841 12.318 29.3334 15.9998 29.3334Z"
                  stroke="#303236"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.6665 16L14.6665 20L22.6665 12"
                  stroke="#303236"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span
                style={{
                  color: "var(--Dark-Gray, #303236)",
                  fontFamily: '"SF Pro", sans-serif',
                  fontSize: "28px",
                  fontStyle: "normal",
                  fontWeight: 510,
                  lineHeight: "normal",
                }}
              >
                Success
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
