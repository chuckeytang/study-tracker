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
  ImageField,
  ImageInput,
} from "react-admin";

// 创建过滤器组件，确保只显示学生
const StudentFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search by Name" source="name" alwaysOn />
  </Filter>
);

// 列出学生的列表
export const StudentList = (props: any) => (
  <List {...props} filters={<StudentFilter />} filter={{ role: "STUDENT" }}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <ImageField source="avartarPicUrl" label="Avartar" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// 创建学生
export const StudentCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput
        source="role"
        defaultValue="STUDENT"
        style={{ display: "none" }}
      />
      <ImageInput
        source="avartar"
        label="Avartar"
        accept={{ "image/*": [".png", ".jpg"] }}
      >
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// 编辑学生
export const StudentEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput
        source="role"
        defaultValue="STUDENT"
        style={{ display: "none" }}
      />
      <ImageInput
        source="avartar"
        label="Avartar"
        accept={{ "image/*": [".png", ".jpg"] }}
      >
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Edit>
);
