import React from "react";
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  Edit,
  SimpleForm,
  NumberInput,
} from "react-admin";

export const ExperienceConfigList = () => (
  <List>
    <Datagrid>
      {/* 显示 level 和 expPoints，但屏蔽删除操作 */}
      <TextField source="level" />
      <TextField source="expPoints" />
      <EditButton /> {/* 仅允许编辑 expPoints */}
    </Datagrid>
  </List>
);

export const ExperienceConfigEdit = () => (
  <Edit>
    <SimpleForm>
      {/* 将 level 字段设置为只读 */}
      <TextField source="level" label="Level" />
      <NumberInput source="expPoints" label="Experience Points" />
    </SimpleForm>
  </Edit>
);