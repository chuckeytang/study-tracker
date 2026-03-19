import React, { useEffect, useState, useRef } from "react";
import Head from "next/head"; // [+] 修复：添加 Head 导入
import { useRouter } from "next/router";
import BareStudentSkillTree from "@/components/SkillTree/BareStudentSkillTree";
import { apiRequest } from "@/utils/api";
import WebUser from "@/utils/user";
import { ChevronDown, Repeat, LogOut } from "lucide-react";

const CourseHome = () => {
  const [courseName, setCourseName] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // 头像下拉菜单状态
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const registerTempUserAndJoinCourse = async () => {
    const existingUserId = localStorage.getItem("tempUserId");
    const res = await apiRequest("/api/system/tempUserRegister", "POST", {
      existingUserId: existingUserId ? Number(existingUserId) : null,
    });

    if (!res.token) throw new Error("No token returned from tempUserRegister");

    localStorage.setItem("token", res.token);
    if (!existingUserId || existingUserId === "undefined") {
      localStorage.setItem("tempUserId", res.userId);
    }

    WebUser.getInstance().markAsExpired();
    setUserId(res.userId);
    return res.userId;
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        let currentUserId: number | null = null;
        try {
          const userDetails = await WebUser.getInstance().getUserData();
          if (userDetails && userDetails.id) {
            currentUserId = userDetails.id;
            setUserId(currentUserId);
          }
        } catch (e) {
          console.log("No valid logged-in user, switching to guest mode.");
        }

        if (!currentUserId) {
          currentUserId = await registerTempUserAndJoinCourse();
        }

        const homepageCourse = await apiRequest(
          "/api/courses/getHomePageCourse"
        );
        setCourseName(homepageCourse.name);
        setCourseId(homepageCourse.id);

        const courseListRes = await apiRequest(
          `/api/student/getCourseList?userId=${currentUserId}`
        );

        const hasJoined = courseListRes.courses.some(
          (c: any) => c.id === homepageCourse.id && c.isLearning
        );

        if (!hasJoined) {
          await apiRequest("/api/student/joinCourse", "POST", {
            studentId: currentUserId,
            courseId: homepageCourse.id,
          });
        }
      } catch (err) {
        console.error("❌ 初始化失败:", err);
        setError("Failed to initialize course experience. " + err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white">
      <Head>
        <title>Trackahabit | Home</title>
        <style>{`
          .font-sf { font-family: "SF Pro", -apple-system, sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
      </Head>

      {/* 顶部导航栏 */}
      <header className="w-full flex items-center justify-between px-6 py-3 shadow-sm bg-white border-b border-gray-100">
        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => router.push("/selection")}>
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <img src="/images/title.png" alt="Title" className="h-8 w-auto" />
        </div>
        
        {/* 右上角头像下拉组件 */}
        <div className="relative" ref={profileMenuRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Moni" 
              alt="Avatar" 
              className="w-9 h-9 rounded-full border border-gray-100 shadow-sm"
            />
            <div className="flex flex-col text-right">
              <span className="text-[13px] font-bold text-[#202224] font-sf leading-tight">Moni Roy</span>
              <span className="text-[11px] text-gray-400 font-medium">Moni Roy@gmail.com</span>
            </div>
            <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center">
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* 下拉菜单内容 */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-gray-100 rounded-[12px] shadow-xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => { router.push("/myExpenses"); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Repeat size={18} className="text-gray-500" />
                <span className="text-[14px] font-bold font-sf text-gray-700">Switch Module</span>
              </button>
              <div className="h-[1px] bg-gray-100 mx-2"></div>
              <button 
                onClick={() => { router.push("/"); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <LogOut size={18} className="text-gray-500" />
                <span className="text-[14px] font-bold font-sf text-gray-700">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {error && <p className="text-red-500 text-center mt-6 font-medium font-sf">{error}</p>}

      <section className="w-full py-16 bg-white text-center">
        <div className="mx-auto">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 font-sf">Loading course content...</p>
            </div>
          ) : courseName && userId && courseId ? (
            <BareStudentSkillTree userId={userId} courseId={courseId} />
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg inline-block">
              <p className="text-red-500 font-semibold font-sf">Course not found or loading failed.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseHome;