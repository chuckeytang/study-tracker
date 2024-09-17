import { Admin, Resource } from "react-admin";
import { CourseList, CourseCreate, CourseEdit } from "./CourseAdmin";
import dataProvider from "@/pages/dataProvider";
import { StudentList } from "./StudentAdmin";
import { TeacherList } from "./TeacherAdmin";
import { BrowserRouter, Route } from "react-router-dom";

const AdminPanel = () => (
  <BrowserRouter>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="courses"
        list={CourseList}
        create={CourseCreate}
        edit={CourseEdit}
        options={{ label: "Courses" }} // 左侧菜单名称为 'Courses'
      />
      <Resource
        name="students"
        list={StudentList} // 显示学生列表，假设已定义 StudentList
        options={{ label: "Students" }} // 左侧菜单名称为 'Students'
      />
      <Resource
        name="teachers"
        list={TeacherList} // 显示教师列表，假设已定义 TeacherList
        options={{ label: "Teachers" }} // 左侧菜单名称为 'Teachers'
      />
    </Admin>
  </BrowserRouter>
);

export default AdminPanel;
