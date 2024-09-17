import React from "react";
import UserInfo from "@/components/UserInfo";

const mockCourses = [
  { id: 1, name: "Mathematics", icon: "📘" },
  { id: 2, name: "Physics", icon: "🔭" },
  { id: 3, name: "History", icon: "📜" },
  { id: 4, name: "Biology", icon: "🧬" },
];

const MyCourses = (props) => {
  const leftCourses = mockCourses.slice(0, 2); // Adjust as per your design needs
  const rightCourses = mockCourses.slice(2);

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
                <div>{course.icon}</div>
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
                <div>{course.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
