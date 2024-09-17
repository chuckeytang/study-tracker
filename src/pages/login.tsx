import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import WidgetInput from "@/components/Widget/WidgetInput";
import WidgetButton from "@/components/Widget/WidgetButton";

export default function LoginPage(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [provider, setProvider] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();

  // 处理邮箱和密码登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Both fields are required");
      return;
    }

    try {
      // 调用后端 API 进行身份验证 (将来需要对接后端)
      console.log("Email:", email);
      console.log("Password:", password);

      const success = true; // 模拟后端响应
      if (!success) {
        setErrorMessage("Invalid email or password");
      } else {
        setErrorMessage("");
        alert("Login successful");
        router.push("/myCourses");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Something went wrong, please try again");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
          Course Tracker
        </h2>

        {/* 显示错误信息 */}
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        {/* 邮箱和密码登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <WidgetInput
              type="email"
              placeholder="Please input your email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
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
              onChange={(e: any) => setPassword(e.target.value)}
              className="mb-4 mt-4"
              required={true}
            />
          </div>
          <WidgetButton
            style="primary"
            type="submit"
            className="text-base items-center"
          >
            Log In
          </WidgetButton>
        </form>

        <p className="text-center text-gray-900">OR</p>

        {/* 注册按钮 */}
        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-500 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
