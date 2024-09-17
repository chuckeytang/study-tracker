import {
  List,
  Datagrid,
  TextField,
  EditButton,
  Button,
  ImageInput,
  ImageField,
} from "react-admin";
import { Create, SimpleForm, TextInput } from "react-admin";
import { Edit } from "react-admin";
import { useRecordContext } from "react-admin";
import { Link } from "react-router-dom";

// DesignButton 组件
const DesignButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Button
      component={Link}
      to={`/courses/${record.id}/design`} // 假设 Design 页面有相应的路由
      label="Design"
    />
  );
};

export const CourseList = (props: any) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      <ImageField source="iconUrl" label="Icon" />
      <EditButton />
      <DesignButton />
    </Datagrid>
  </List>
);

export const CourseCreate = (props: any) => (
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

export const CourseEdit = (props: any) => (
  <Edit {...props}>
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
  </Edit>
);
