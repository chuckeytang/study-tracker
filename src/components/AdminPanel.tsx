import { Admin, Resource } from "react-admin";
import { CourseList, CourseCreate, CourseEdit } from "./CourseAdmin";
import dataProvider from "@/pages/dataProvider";
import { StudentCreate, StudentEdit, StudentList } from "./StudentAdmin";
import { TeacherCreate, TeacherEdit, TeacherList } from "./TeacherAdmin";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminCustomLayout from "./AdminCustomLayout";
import {
  AdministratorCreate,
  AdministratorEdit,
  AdministratorList,
} from "./AdministratorAdmin";

const AdminPanel = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.role) {
      setRole(user.role); // 获取用户角色
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 重定向 /admin 到 /courses */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/courses" replace />}
        />

        {/* react-admin 的页面会在这个路径下加载 */}
        <Route
          path="/admin/*"
          element={
            <Admin
              basename="/admin"
              dataProvider={dataProvider}
              layout={AdminCustomLayout}
            >
              {role != "STUDENT" && (
                <Resource
                  name="courses"
                  list={CourseList}
                  create={CourseCreate}
                  edit={CourseEdit}
                  options={{ label: "Courses" }} // 左侧菜单名称为 'Courses'
                />
              )}

              {role === "ADMIN" && (
                <Resource
                  name="administrators"
                  list={AdministratorList}
                  create={AdministratorCreate}
                  edit={AdministratorEdit}
                  options={{ label: "Administrators" }} // 左侧菜单名称为 'Admin'
                />
              )}
              {role === "ADMIN" && (
                <Resource
                  name="students"
                  list={StudentList}
                  create={StudentCreate}
                  edit={StudentEdit}
                  options={{ label: "Students" }} // 左侧菜单名称为 'Students'
                />
              )}
              {role === "ADMIN" && (
                <Resource
                  name="teachers"
                  list={TeacherList}
                  create={TeacherCreate}
                  edit={TeacherEdit}
                  options={{ label: "Teachers" }} // 左侧菜单名称为 'Teachers'
                />
              )}
            </Admin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AdminPanel;
