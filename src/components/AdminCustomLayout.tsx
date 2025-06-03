import { Layout, AppBar, TitlePortal, useLogout, Button } from "react-admin";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// 自定义 AppBar 以处理左上角点击事件
const AdminCustomAppBar = (props: any) => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const logout = useLogout();

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

  const handleLogout = () => {
    logout();
    window.location.href = "/home";
  };

  return (
    <AppBar {...props}>
      {/* 显示默认标题，并绑定点击事件 */}
      <TitlePortal>
        <span onClick={handleTitleClick} style={{ cursor: "pointer" }}>
          My Courses
        </span>
      </TitlePortal>
      <Button color="inherit" onClick={handleLogout}>
        <span>Logout</span>
      </Button>
    </AppBar>
  );
};

// 自定义 Layout 组件
const AdminCustomLayout = (props: any) => (
  <Layout {...props} appBar={AdminCustomAppBar} />
);

export default AdminCustomLayout;
