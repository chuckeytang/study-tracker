import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  Edit,
  Filter,
} from "react-admin";

// 创建过滤器组件，确保只显示老师
const TeacherFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search by Name" source="name" alwaysOn />
  </Filter>
);

// 列出老师的列表
export const TeacherList = (props: any) => (
  <List {...props} filters={<TeacherFilter />} filter={{ role: "TEACHER" }}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// 创建老师
export const TeacherCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
    </SimpleForm>
  </Create>
);

// 编辑老师
export const TeacherEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
    </SimpleForm>
  </Edit>
);
