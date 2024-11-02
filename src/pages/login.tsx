import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import WidgetInput from "@/components/Widget/WidgetInput";
import WidgetButton from "@/components/Widget/WidgetButton";
import { apiRequest } from "@/utils/api";

const fetchUserDetails = async (token: string) => {
  try {
    const userDetails = await apiRequest(
      "/api/users/getMe",
      "GET",
      null,
      false
    );
    localStorage.setItem("user", JSON.stringify(userDetails));
    return userDetails;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
};

export default function LoginPage(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // 处理邮箱和密码登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Both fields are required");
      return;
    }

    try {
      const data = await apiRequest(
        "/api/system/login",
        "POST",
        {
          email,
          password,
        },
        true
      );

      if (data.token) {
        const token = data.token;
        localStorage.setItem("token", token); // 将 token 存储到 localStorage
        setErrorMessage(""); // 清空错误信息
        let userDetails = await fetchUserDetails(token); // 获取用户详细信息
        // 根据用户角色跳转
        if (userDetails.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push(`/myCourses`);
        }
      } else {
        setErrorMessage("Invalid email or password");
      }
    } catch (error) {
      setErrorMessage("Login failed: " + error);
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
