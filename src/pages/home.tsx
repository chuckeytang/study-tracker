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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const existingUserId = localStorage.getItem("tempUserId");

        const tempUserRes = await apiRequest(
          "/api/system/tempUserRegister",
          "POST",
          {
            existingUserId: existingUserId ? Number(existingUserId) : null,
          }
        );

        if (tempUserRes.token) {
          localStorage.setItem("token", tempUserRes.token);
          const tempUserId = tempUserRes.userId;

          if (!existingUserId || existingUserId === "undefined") {
            localStorage.setItem("tempUserId", tempUserId);
          }

          WebUser.getInstance().markAsExpired();
          setUserId(tempUserId);
        } else {
          throw new Error("No token in temp user response");
        }

        const homepageCourse = await apiRequest(
          "/api/courses/getHomePageCourse"
        );
        setCourseName(homepageCourse.name);
        setCourseId(homepageCourse.id);

        const courseListRes = await apiRequest(
          `/api/student/getCourseList?userId=${tempUserRes.userId}`
        );

        const hasJoined = courseListRes.courses.some(
          (c: any) => c.id === homepageCourse.id && c.isLearning
        );

        if (!hasJoined) {
          await apiRequest("/api/student/joinCourse", "POST", {
            studentId: tempUserRes.userId,
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
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 border text-black border-gray-400 rounded-full hover:bg-gray-100 transition"
        >
          Log in
        </button>
      </header>

      {/* Hero 区域 */}
      <section
        className="w-full py-24 text-white text-center bg-[#090f26]"
        style={{
          backgroundImage: "url('/images/bg_student.jpg')",
          backgroundSize: "cover",
          backgroundBlendMode: "multiply",
        }}
      >
        <h1 className="text-4xl font-bold mb-4">
          Join learners building better habits
        </h1>
        <p className="text-lg opacity-80">
          Track your skills. Visualize your progress. Build better habits—one
          step at a time.
        </p>
      </section>

      {/* 错误信息 */}
      {error && <p className="text-red-500 text-center mt-6">{error}</p>}

      {/* 试用课程 */}
      <section className="w-full py-16 bg-white text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Sample Course Preview
        </h2>
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
