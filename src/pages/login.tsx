import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import WidgetInput from "@/components/Widget/WidgetInput";
import WidgetButton from "@/components/Widget/WidgetButton";
import { apiRequest } from "@/utils/api";
import WebUser from "@/utils/user";

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
        localStorage.setItem("token", data.token);
        setErrorMessage("");
        WebUser.getInstance().markAsExpired();
        let userDetails = await WebUser.getInstance().getUserData();
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

  const handleTryNow = async () => {
    try {
      // 获取现有用户 ID（如果已经有存储的临时用户信息）
      const existingUserId = localStorage.getItem("tempUserId");

      const response = await apiRequest(
        "/api/system/tempUserRegister",
        "POST",
        {
          existingUserId: existingUserId ? Number(existingUserId) : null,
        }
      );

      if (response.token) {
        localStorage.setItem("token", response.token); // 保存 Token
        if (!existingUserId || existingUserId === "undefined") {
          localStorage.setItem("tempUserId", response.userId); // 保存临时用户 ID
        }
        WebUser.getInstance().markAsExpired();
        router.push(`/myCourses`);
      }
    } catch (error) {
      console.error("Error during Try Now:", error);
      setErrorMessage("Unable to start trial, please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
          Course Tracker
        </h2>

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

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

        {/* Try Now 按钮 */}
        <p className="mt-4 text-center text-gray-400">
          Or{" "}
          <button
            onClick={handleTryNow}
            className="text-blue-500 hover:underline"
          >
            Try NOW
          </button>
        </p>
      </div>
    </div>
  );
}
