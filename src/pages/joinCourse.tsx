import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog } from "@headlessui/react";
import WidgetSelect from "@/components/Widget/WidgetSelect";
import { apiRequest } from "@/utils/api";

interface Course {
  id: number;
  name: string;
  description: string;
  isLearning: boolean;
  iconUrl?: string;
}

interface Teacher {
  id: number;
  name: string;
}

const JoinCourse: React.FC = (props) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Fetch teachers on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userDetails = JSON.parse(storedUser);
      setUser(userDetails);
    } else {
      // 如果localStorage中没有用户信息，可以跳转到登录页面
      router.push("/login");
    }

    const fetchTeachers = async () => {
      try {
        const data = await apiRequest("/api/teacher/getAllTeachers");
        setTeachers(data.teachers);
        setSelectedTeacher(data.teachers[0] || null); // Default to first teacher
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch courses when selected teacher changes
  useEffect(() => {
    if (!selectedTeacher) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await apiRequest(
          `/api/teacher/getCourseList?userId=${selectedTeacher.id}`
        );
        setCourses(data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedTeacher]);

  const handleJoinCourse = async () => {
    if (!selectedCourseId || !user?.id) return;

    try {
      await apiRequest("/api/student/joinCourse", "POST", {
        studentId: Number(user?.id),
        courseId: selectedCourseId,
      });
      const updatedCourses = courses.map((course) =>
        course.id === selectedCourseId
          ? { ...course, isLearning: true }
          : course
      );
      setCourses(updatedCourses);
      setIsJoinDialogOpen(false);
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

  return (
    <div className="flex items-center justify-center bg-[url('/images/bg_student.jpg')] min-h-screen bg-cover">
      <div className="rounded-2xl bg-stone-100 w-3/4 my-10 min-h-screen flex flex-col items-center">
        {/* Teacher Selection */}
        <WidgetSelect
          options={teachers.map((teacher) => ({
            value: teacher.id,
            label: teacher.name,
          }))}
          className="my-6 w-1/3"
          onChange={(teacherId) => {
            const selected = teachers.find(
              (teacher) => teacher.id === Number(teacherId)
            );
            setSelectedTeacher(selected || null);
          }}
        />

        {/* Course List */}
        <div className="flex flex-wrap justify-center w-full p-6">
          {loading ? (
            <div className="flex justify-center items-center min-h-screen">
              Loading...
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center text-gray-700">
              No courses available
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="m-4 flex flex-col items-center cursor-pointer"
                onClick={() => {
                  if (course.isLearning) {
                    router.push(`/skillTree/${user?.id}?courseId=${course.id}`);
                  } else {
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
                <div className="text-center text-gray-800 font-bold">
                  {course.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Join Course Dialog */}
      <Dialog
        open={isJoinDialogOpen}
        onClose={closeJoinDialog}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          aria-hidden="true"
        />
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
      <button
        onClick={() => router.push("/myCourses")}
        className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold"
      >
        Back to My Courses
      </button>
    </div>
  );
};

export default JoinCourse;
