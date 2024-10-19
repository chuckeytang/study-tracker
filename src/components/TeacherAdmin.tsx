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
  ImageInput,
  ImageField,
  PasswordInput,
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
      <ImageField source="avartarPicUrl" label="Avartar" />
      <EditButton />
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

// 创建老师
export const TeacherCreate = (props: any) => (
  <Create mutationMode="pessimistic" {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" defaultValue="" />
      <TextInput
        source="role"
        defaultValue="TEACHER"
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

// 编辑老师
export const TeacherEdit = (props: any) => (
  <Edit mutationMode="pessimistic" {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" defaultValue="" />
      <TextInput
        source="role"
        defaultValue="TEACHER"
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
