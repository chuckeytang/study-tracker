import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserInfo from "@/components/UserInfo";
import Link from "next/link";
import { Dialog } from "@headlessui/react";

interface Course {
  id: number;
  name: string;
  description: string;
  isLearning: boolean;
  iconUrl?: string; // 可能没有 iconUrl，所以用可选属性
}

const MyCourses: React.FC = (props) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"STUDENT" | "TEACHER" | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const router = useRouter();
  const { userId } = router.query;

  useEffect(() => {
    if (!router.isReady || !userId) return;

    // Fetch user role
    const fetchUserRole = async () => {
      try {
        const response = await fetch(`/api/users/getOne?id=${userId}`);
        const data = await response.json();

        if (response.ok) {
          setUserRole(data.role); // 设置用户角色为 'TEACHER' 或 'STUDENT'
        } else {
          console.error("Failed to fetch user role:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, [router.isReady, userId]);

  useEffect(() => {
    if (!userRole || !userId) return;

    // 根据用户角色获取课程列表
    const fetchCourses = async () => {
      try {
        const apiUrl =
          userRole === "TEACHER"
            ? `/api/teacher/getCourseList?userId=${userId}`
            : `/api/student/getCourseList?userId=${userId}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
          setCourses(data.courses);
        } else {
          console.error("Error fetching courses:", data.error);
        }
      } catch (error) {
        console.error("Error fetching course list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userRole, userId]);

  const handleJoinCourse = async () => {
    if (!selectedCourseId || !userId) return;

    try {
      const response = await fetch("/api/student/joinCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: Number(userId),
          courseId: selectedCourseId,
        }),
      });

      if (response.ok) {
        alert("Successfully joined the course!");
        // 刷新页面或更新课程列表
        const updatedCourses = courses.map((course) =>
          course.id === selectedCourseId
            ? { ...course, isLearning: true }
            : course
        );
        setCourses(updatedCourses);
        setIsJoinDialogOpen(false); // 关闭对话框
      } else {
        const errorData = await response.json();
        console.error("Failed to join course:", errorData.error);
        alert("Failed to join course.");
      }
    } catch (error) {
      console.error("Error joining course:", error);
      alert("An error occurred while joining the course.");
    }
  };

  const openJoinDialog = (courseId: number) => {
    setSelectedCourseId(courseId);
    setIsJoinDialogOpen(true);
  };

  const closeJoinDialog = () => {
    setIsJoinDialogOpen(false);
    setSelectedCourseId(null);
  };

  // Split the courses into left and right
  const leftCourses = courses.slice(0, Math.ceil(courses.length / 2)); // First half of courses
  const rightCourses = courses.slice(Math.ceil(courses.length / 2)); // Second half of courses

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-[url('/images/bg.jpg')] min-h-screen bg-cover">
      <div className="rounded-2xl bg-stone-100 w-3/4 my-10 min-h-screen flex justify-between">
        <div className="flex flex-col items-start p-10 w-1/3">
          {leftCourses.map((course) => (
            <div
              key={course.id}
              className="flex justify-start mb-4 items-center cursor-pointer"
              onClick={() => {
                // 如果是学生且已经学习了该课程，则跳转到 skillTree 页面
                if (course.isLearning) {
                  router.push(`/skillTree/${userId}?courseId=${course.id}`);
                } else if (userRole === "STUDENT" && !course.isLearning) {
                  // 如果是学生且未学习该课程，则弹出加入课程的对话框
                  openJoinDialog(course.id);
                }
              }}
            >
              <div
                className={`rounded-xl border-8 ${
                  course.isLearning ? "border-amber-400" : "border-gray-300"
                } p-2`}
              >
                <img
                  src={course.iconUrl || "/images/course_default_icon.png"}
                  alt={course.name}
                  className="w-16 h-16"
                />
              </div>
              <div className="ml-4 text-gray-800 font-bold">{course.name}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between w-1/3">
          <div className="text-gray-800 font-bold text-3xl flex items-center justify-center mt-4">
            My Courses
          </div>
          {/* User Info */}
          <UserInfo userId={Number(userId)} />
          {courses.length === 0 && (
            <div className="flex justify-center items-center p-10">
              No courses
            </div>
          )}
          {courses.length != 0 && (
            <div className="flex justify-center items-center p-12"></div>
          )}
        </div>

        <div className="flex flex-col items-start p-10 w-1/3">
          {rightCourses.map((course) => (
            <div
              key={course.id}
              className="flex justify-start mb-4 items-center cursor-pointer"
              onClick={() => {
                // 如果是学生且已经学习了该课程，则跳转到 skillTree 页面
                if (course.isLearning) {
                  router.push(`/skillTree/${userId}?courseId=${course.id}`);
                } else if (userRole === "STUDENT" && !course.isLearning) {
                  // 如果是学生且未学习该课程，则弹出加入课程的对话框
                  openJoinDialog(course.id);
                }
              }}
            >
              <div className="mr-4 text-gray-800 font-bold">{course.name}</div>
              <div
                className={`rounded-xl border-8 ${
                  course.isLearning ? "border-amber-400" : "border-gray-300"
                } p-2`}
              >
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

      {/* 加入课程对话框 */}
      <Dialog
        open={isJoinDialogOpen}
        onClose={closeJoinDialog}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* 黑色半透明遮罩 */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          aria-hidden="true"
        />

        {/* 对话框内容 */}
        <div className="relative bg-white p-6 rounded-xl shadow-lg text-center w-1/2 h-1/3">
          <Dialog.Panel>
            <Dialog.Title>
              <h2 className="text-2xl font-bold text-gray-800">Join Course</h2>
            </Dialog.Title>

            <div className="mt-6 text-gray-800 mb-10">
              <p>Are you sure you want to join this course?</p>
            </div>
            <div className="mt-4 flex justify-around">
              <button
                onClick={handleJoinCourse}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Join
              </button>
              <button
                onClick={closeJoinDialog}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MyCourses;
