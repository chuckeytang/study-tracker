import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserInfo from "@/components/UserInfo";
import { Dialog } from "@headlessui/react";
import { apiRequest } from "@/utils/api";
import WebUser from "@/utils/user";

interface Course {
  id: number;
  name: string;
  description: string;
  isLearning: boolean;
  iconUrl?: string;
}

const MyCourses: React.FC = (props: any) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = await WebUser.getInstance().getUserData();
      setUser(storedUser);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!user) return;

    // 根据用户角色获取课程列表
    const fetchCourses = async () => {
      try {
        const apiUrl =
          user.role === "TEACHER"
            ? `/api/teacher/getCourseList?userId=${user.id}`
            : `/api/student/getCourseList?userId=${user.id}`;

        const data = await apiRequest(apiUrl);
        const filteredCourses = data.courses.filter(
          (course: any) => course.isLearning
        );

        setCourses(filteredCourses);
      } catch (error) {
        console.error("Error fetching course list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // Split the courses into left and right
  const leftCourses = courses.slice(0, Math.ceil(courses.length / 2)); // First half of courses
  const rightCourses = courses.slice(Math.ceil(courses.length / 2)); // Second half of courses

  const courseBorderColor =
    user?.role === "TEACHER" ? "border-purple-500" : "border-amber-400";
  const buttonColor =
    user?.role === "TEACHER" ? "bg-purple-700" : "bg-amber-700";
  const backgroundImage =
    user?.role === "TEACHER"
      ? "bg-[url('/images/bg_teacher.jpg')]"
      : "bg-[url('/images/bg_student.jpg')]";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${backgroundImage} min-h-screen bg-cover`}
    >
      <div className="rounded-2xl bg-stone-100 w-3/4 my-10 min-h-screen flex justify-between">
        <div className="flex flex-col items-start p-10 w-1/3">
          {leftCourses
            .filter((course) => course.isLearning)
            .map((course) => (
              <div
                key={course.id}
                className="flex justify-start mb-4 items-center cursor-pointer"
                onClick={() => {
                  router.push(
                    `/skillTree/${user?.id}?courseId=${course.id}&courseName=${course.name}`
                  );
                }}
              >
                <div className={`rounded-xl border-8 ${courseBorderColor} p-2`}>
                  <img
                    src={course.iconUrl || "/images/course_default_icon.png"}
                    alt={course.name}
                    className="w-16 h-16"
                  />
                </div>
                <div className="ml-4 text-gray-800 font-bold">
                  {course.name}
                </div>
                {/* <div className="text-sm text-gray-600">
                  Instructor: {selectedTeacher?.name}
                </div> */}
              </div>
            ))}
        </div>

        <div className="flex flex-col justify-between w-1/3">
          <div className="text-gray-800 font-bold text-3xl flex items-center justify-center mt-4">
            My Courses
          </div>
          {/* User Info */}
          <UserInfo user={user!} />
          {courses.length === 0 && (
            <div className="flex flex-col justify-center items-start mb-20 text-2xl font-bold text-gray-700">
              <div>No courses?</div>{" "}
              <div>
                Click {user?.role === "TEACHER" ? "Add Course" : "Join Course"}.
              </div>
            </div>
          )}
          {courses.length != 0 && (
            <div className="flex justify-center items-center p-12"></div>
          )}
        </div>

        <div className="flex flex-col items-start p-10 w-1/3">
          {rightCourses
            .filter((course) => course.isLearning) // 只显示已经学习的课程
            .map((course) => (
              <div
                key={course.id}
                className="flex justify-start mb-4 items-center cursor-pointer"
                onClick={() => {
                  router.push(
                    `/skillTree/${user?.id}?courseId=${course.id}&courseName=${course.name}`
                  );
                }}
              >
                <div className="mr-4 text-gray-800 font-bold">
                  {course.name}
                </div>
                <div className={`rounded-xl border-8 ${courseBorderColor} p-2`}>
                  <img
                    src={course.iconUrl || "/images/course_default_icon.png"}
                    alt={course.name}
                    className="w-16 h-16"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      <button
        onClick={() => router.push("/login")}
        className={`fixed bottom-4 right-4 ${buttonColor} text-white px-4 py-2 rounded-lg shadow-lg font-bold`}
      >
        Logout
      </button>
    </div>
  );
};

export default MyCourses;
