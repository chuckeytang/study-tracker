import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserInfo from "@/components/UserInfo";

interface Course {
  id: number;
  name: string;
  iconUrl?: string; // 可能没有 iconUrl，所以用可选属性
}

const MyCourses: React.FC = (props) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { userId } = router.query;

  useEffect(() => {
    if (!userId) return; // 如果 userId 还没有加载出来，返回

    // Fetch course list from API
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `/api/student/getCourseList?userId=${userId}`
        );
        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses); // Set the courses data from the API
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
  }, [userId]);

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
      <div className="rounded-2xl bg-stone-100 w-3/4 my-10 min-h-screen">
        <div className="text-gray-800 font-bold text-3xl flex items-center justify-center mt-4">
          My Courses
        </div>
        <div className="flex items-center justify-between mt-10">
          <div className="flex flex-col items-start p-10">
            {leftCourses.map((course) => (
              <div key={course.id} className="flex justify-start mb-4">
                <div>
                  {course.iconUrl ? (
                    <img
                      src={course.iconUrl}
                      alt={course.name}
                      className="w-8 h-8"
                    />
                  ) : (
                    "📘"
                  )}
                </div>
                <div className="ml-2 text-gray-800">{course.name}</div>
              </div>
            ))}
          </div>

          {/* User Info */}
          <UserInfo />

          <div className="flex flex-col items-start p-10">
            {rightCourses.map((course) => (
              <div key={course.id} className="flex justify-start mb-4">
                <div className="mr-2 text-gray-800">{course.name}</div>
                <div>
                  {course.iconUrl ? (
                    <img
                      src={course.iconUrl}
                      alt={course.name}
                      className="w-8 h-8"
                    />
                  ) : (
                    "📘"
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {courses.length === 0 && (
          <div className="flex justify-center items-center p-10">
            No courses
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
