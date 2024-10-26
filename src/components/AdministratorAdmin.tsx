import React, { useEffect } from "react";
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  ImageInput,
  ImageField,
  PasswordInput,
  Edit,
  useEditController,
  Filter,
} from "react-admin";

// 创建过滤器组件，确保只显示管理员
const AdminFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search by Name" source="name" alwaysOn />
  </Filter>
);

// 列出管理员的列表
export const AdministratorList = (props: any) => (
  <List {...props} filters={<AdminFilter />} filter={{ role: "ADMIN" }}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <ImageField source="avartarPicUrl" label="Avatar" />
      <EditButton />
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

// 创建管理员
export const AdministratorCreate = (props: any) => (
  <Create mutationMode="pessimistic" {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" defaultValue="" />
      <TextInput
        source="role"
        defaultValue="ADMIN"
        style={{ display: "none" }}
      />
      <ImageInput
        source="avartar"
        label="Avatar"
        accept={{ "image/*": [".png", ".jpg"] }}
      >
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// 编辑管理员
export const AdministratorEdit = (props: any) => {
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
          defaultValue="ADMIN"
          style={{ display: "none" }}
        />
        <ImageInput
          source="avartar"
          label="Avatar"
          accept={{ "image/*": [".png", ".jpg"] }}
          defaultValue={
            record?.avartarPicUrl
              ? [{ src: record.avartarPicUrl, title: "Current Avatar" }]
              : []
          }
        >
          <ImageField source="src" title="title" />
        </ImageInput>
      </SimpleForm>
    </Edit>
  );
};
