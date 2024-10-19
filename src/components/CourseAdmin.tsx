import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ImageInput,
  ImageField,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  Edit,
  TopToolbar,
  CreateButton,
  useEditController,
} from "react-admin";
import { useEffect, useState } from "react";

const ListActions = ({ role, resource }: any) => (
  <TopToolbar>
    {/* 只有 TEACHER 角色才能看到 Create 按钮 */}
    {role === "TEACHER" && <CreateButton resource={resource} />}
    {/* 这里没有包含 ExportButton，因此它不会显示 */}
  </TopToolbar>
);

export const CourseList = (props: any) => {
  // 获取用户角色信息
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.role) {
      setRole(user.role); // 获取用户角色
    }
  }, []);

  return (
    <List {...props} actions={<ListActions role={role} />}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="description" />
        <ImageField source="iconUrl" label="Icon" />

        {/* 只有 TEACHER 角色才能看到 Edit 和 Delete 按钮 */}
        {role === "TEACHER" && <EditButton />}
        {(role === "TEACHER" || role === "ADMIN") && (
          <DeleteButton mutationMode="pessimistic" />
        )}
      </Datagrid>
    </List>
  );
};

export const CourseCreate = (props: any) => {
  // 获取用户角色信息
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.role) {
      setRole(user.role); // 获取用户角色
    }
  }, []);

  // 只有 TEACHER 角色才能看到 Create 表单
  if (role !== "TEACHER") return null;

  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="description" />
        <ImageInput
          source="icon"
          label="Icon"
          accept={{ "image/*": [".png", ".jpg"] }}
        >
          <ImageField source="src" title="title" />
        </ImageInput>
      </SimpleForm>
    </Create>
  );
};

export const CourseEdit = (props: any) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.role) {
      setRole(user.role); // 获取用户角色
    }
  }, []);

  const { record, isLoading } = useEditController(props);

  useEffect(() => {
    if (record) {
      console.log("Record:", record); // 打印加载的 record 数据
    }
  }, [record]);

  // 根据角色决定是否禁用输入字段，ADMIN 不能编辑
  const isDisabled = role === "ADMIN";

  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="name" disabled={isDisabled} />
        <TextInput source="description" disabled={isDisabled} />
        {isDisabled && <ImageField source="iconUrl" label="Current Icon" />}
        {!isDisabled && (
          <ImageInput
            source="icon"
            label="Icon"
            accept={{ "image/*": [".png", ".jpg"] }}
            defaultValue={
              record?.iconUrl
                ? [{ src: record.avartarPicUrl, title: "Current Avatar" }]
                : []
            }
          >
            <ImageField source="src" title="title" />
          </ImageInput>
        )}
      </SimpleForm>
    </Edit>
  );
};
