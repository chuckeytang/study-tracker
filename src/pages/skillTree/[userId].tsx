import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TeacherSkillTree from "@/components/SkillTree/TeacherSkillTree";
import StudentSkillTree from "@/components/SkillTree/StudentSkillTree";
import OtherStudentSkillTree from "@/components/SkillTree/OtherStudentSkillTree";
import { apiRequest } from "@/utils/api";

const SkillTree = (props: any) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const { userId, courseName, otherStudent } = router.query;

  useEffect(() => {
    if (!router.isReady || !userId) return;

    // Fetch user role
    const fetchUserRole = async () => {
      try {
        const data = await apiRequest(`/api/users/getOne?id=${userId}`);
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, [router.isReady, userId]);

  if (!userRole) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {userRole === "TEACHER" ? (
        <TeacherSkillTree courseName={courseName as string} />
      ) : otherStudent === "1" ? (
        <OtherStudentSkillTree courseName={courseName as string} />
      ) : (
        <StudentSkillTree courseName={courseName as string} />
      )}
    </>
  );
};

export default SkillTree;
