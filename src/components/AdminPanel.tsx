import { Admin, Resource } from "react-admin";
import { CourseList, CourseCreate, CourseEdit } from "./CourseAdmin";
import dataProvider from "@/pages/dataProvider";
import { StudentCreate, StudentEdit, StudentList } from "./StudentAdmin";
import { TeacherCreate, TeacherEdit, TeacherList } from "./TeacherAdmin";
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
        list={StudentList}
        create={StudentCreate}
        edit={StudentEdit}
        options={{ label: "Students" }} // 左侧菜单名称为 'Students'
      />
      <Resource
        name="teachers"
        list={TeacherList}
        create={TeacherCreate}
        edit={TeacherEdit}
        options={{ label: "Teachers" }} // 左侧菜单名称为 'Teachers'
      />
    </Admin>
  </BrowserRouter>
);

export default AdminPanel;
