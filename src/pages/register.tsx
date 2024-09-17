import WidgetButton from "@/components/Widget/WidgetButton";
import WidgetInput from "@/components/Widget/WidgetInput";
import router from "next/router";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!email) {
      setErrorMessage("Email is required");
      return;
    }

    try {
      // 调用后端 API 发送验证码
      console.log("Sending verification code to:", email);

      // 模拟成功发送验证码
      setCountdown(60); // 60 秒倒计时
      setErrorMessage("");

      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error sending verification code:", error);
      setErrorMessage("Failed to send verification code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !verificationCode) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      // 调用后端 API 完成注册
      console.log("Registering with:", { email, password, verificationCode });

      // 模拟注册成功
      router.push("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("Registration failed, please try again");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
          Register
        </h2>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <WidgetInput
              type="text"
              placeholder="Please input your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 mt-4"
              required={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <WidgetInput
              type="password"
              placeholder="Please input your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 mt-4"
              required={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <WidgetInput
              type="text"
              placeholder="Please input your email"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mb-4 mt-4"
              required={true}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={countdown > 0}
              className={`w-full mt-2 py-2 px-4 rounded-lg ${
                countdown > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : "Send Verification Code"}
            </button>
          </div>
          <WidgetButton
            style="primary"
            type="submit"
            className="text-base items-center"
          >
            Register
          </WidgetButton>
        </form>
      </div>
    </div>
  );
}
