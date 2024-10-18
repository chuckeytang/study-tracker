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
  useInput,
} from "react-admin";
import { useState } from "react";
import {
  IconButton,
  InputAdornment,
  TextField as MuiTextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// 自定义密码输入控件，带可见性切换
const PasswordInput = (props: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const { field } = useInput(props);

  return (
    <MuiTextField
      {...field}
      type={showPassword ? "text" : "password"}
      label="Password"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

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
      <PasswordInput source="password" /> {/* 密码输入控件 */}
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
      <PasswordInput source="password" /> {/* 密码输入控件 */}
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
