import { useEffect } from "react";
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
  PasswordInput,
  useEditController,
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
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

// 创建学生
export const StudentCreate = (props: any) => (
  <Create mutationMode="pessimistic" {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" defaultValue="" />
      <TextInput
        source="role"
        defaultValue="STUDENT"
        style={{ display: "none" }}
      />
      <ImageInput
        source="avartar"
        label="Avartar"
        accept={{ "image/*": [".png", ".jpg"] }}
        defaultValue={[
          { src: "/uploads/1729319788393.jpg", title: "Current Avatar" },
        ]}
      >
        <ImageField source="src" title="Current Avatar" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// 编辑学生
export const StudentEdit = (props: any) => {
  const { record, isLoading } = useEditController(props);

  useEffect(() => {
    if (record) {
      console.log("Record:", record); // 打印加载的 record 数据
    }
  }, [record]);

  return (
    <Edit mutationMode="pessimistic" {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="email" />
        <PasswordInput source="password" defaultValue="" />
        <TextInput
          source="role"
          defaultValue="STUDENT"
          style={{ display: "none" }}
        />
        <ImageInput
          source="avartar"
          label="Avartar"
          accept={{ "image/*": [".png", ".jpg"] }}
          defaultValue={
            record?.avartarPicUrl
              ? [{ src: record.avartarPicUrl, title: "Current Avatar" }]
              : []
          }
        >
          <ImageField source="src" title="Current Avatar" />
        </ImageInput>
      </SimpleForm>
    </Edit>
  );
};
