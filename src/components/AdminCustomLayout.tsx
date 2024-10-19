import { Layout, AppBar, TitlePortal } from "react-admin";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// 自定义 AppBar 以处理左上角点击事件
const AdminCustomAppBar = (props: any) => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.role) {
      setRole(user.role); // 获取用户角色
    }
  }, []);

  const handleTitleClick = () => {
    if (role === "TEACHER") {
      router.push("/myCourses");
    } else if (role === "STUDENT") {
      router.push("/joinCourses");
    }
  };

  return (
    <AppBar {...props}>
      {/* 显示默认标题，并绑定点击事件 */}
      <TitlePortal>
        <span onClick={handleTitleClick} style={{ cursor: "pointer" }}>
          My Courses
        </span>
      </TitlePortal>
    </AppBar>
  );
};

// 自定义 Layout 组件
const AdminCustomLayout = (props: any) => (
  <Layout {...props} appBar={AdminCustomAppBar} />
);

export default AdminCustomLayout;
