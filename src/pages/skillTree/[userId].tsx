import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TeacherSkillTree from "@/components/SkillTree/TeacherSkillTree";
import StudentSkillTree from "@/components/SkillTree/StudentSkillTree";

const SkillTree = (props) => {
  const [userRole, setUserRole] = useState<string | null>(null);
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
          setUserRole(data.role); // data.role should be 'TEACHER' or 'STUDENT'
        } else {
          console.error("Failed to fetch user role:", data.error);
        }
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
    <>{userRole === "TEACHER" ? <TeacherSkillTree /> : <StudentSkillTree />}</>
  );
};

export default SkillTree;
