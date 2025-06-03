import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BareStudentSkillTree from "@/components/SkillTree/BareStudentSkillTree";
import { apiRequest } from "@/utils/api";
import WebUser from "@/utils/user";

const CourseHome = () => {
  const [courseName, setCourseName] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerTempUserAndJoinCourse = async () => {
    const existingUserId = localStorage.getItem("tempUserId");
    const res = await apiRequest("/api/system/tempUserRegister", "POST", {
      existingUserId: existingUserId ? Number(existingUserId) : null,
    });
    console.log("registerTempUserAndJoinCourse:", res);

    if (!res.token) throw new Error("No token returned from tempUserRegister");

    localStorage.setItem("token", res.token);
    if (!existingUserId || existingUserId === "undefined") {
      localStorage.setItem("tempUserId", res.userId);
    }

    WebUser.getInstance().markAsExpired();
    setUserId(res.userId);
    return res.userId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Both fields are required");

    try {
      const res = await apiRequest(
        "/api/system/login",
        "POST",
        { email, password },
        true
      );

      if (!res.token) return setError("Invalid credentials");

      localStorage.setItem("token", res.token);
      WebUser.getInstance().markAsExpired();

      const user = await WebUser.getInstance().getUserData();
      router.push(user.role === "ADMIN" ? "/admin" : "/myCourses");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const tempUserId = await registerTempUserAndJoinCourse();

        const homepageCourse = await apiRequest(
          "/api/courses/getHomePageCourse"
        );
        setCourseName(homepageCourse.name);
        setCourseId(homepageCourse.id);

        const courseListRes = await apiRequest(
          `/api/student/getCourseList?userId=${tempUserId}`
        );
        console.log("courseListRes", courseListRes);

        const hasJoined = courseListRes.courses.some(
          (c: any) => c.id === homepageCourse.id && c.isLearning
        );

        console.log("hasJoined", hasJoined);

        if (!hasJoined) {
          await apiRequest("/api/student/joinCourse", "POST", {
            studentId: tempUserId,
            courseId: homepageCourse.id,
          });
        }
      } catch (err) {
        console.error("❌ 初始化失败:", err);
        setError("Failed to initialize trial experience. " + err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <div className="min-h-screen w-full bg-white">
      {/* 顶部导航栏 */}
      <header className="w-full flex items-center justify-between px-6 py-4 shadow-sm bg-white">
        <div className="flex items-center space-x-1">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <img src="/images/title.png" alt="Title" className="h-8 w-auto" />
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-1 border rounded-md text-sm w-44"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-3 py-1 border rounded-md text-sm w-44"
          />
          <button
            type="submit"
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-blue-500 hover:underline text-sm ml-2"
          >
            Register
          </button>
        </form>
      </header>

      {/* 错误信息 */}
      {error && <p className="text-red-500 text-center mt-6">{error}</p>}

      {/* 试用课程 */}
      <section className="w-full py-16 bg-white text-center">
        、
        <div className="mx-auto">
          {loading ? (
            <p className="text-gray-500">Loading preview course...</p>
          ) : courseName && userId && courseId ? (
            <BareStudentSkillTree userId={userId} courseId={courseId} />
          ) : (
            <p className="text-red-500">Sample Course Load Failed</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseHome;
