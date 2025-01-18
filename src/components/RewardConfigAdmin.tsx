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

export const RewardConfigList = () => (
  <List>
    <Datagrid>
      {/* 显示 level 和 rewardPoints，但屏蔽删除操作 */}
      <TextField source="level" />
      <TextField source="rewardPoints" />
      <EditButton /> {/* 仅允许编辑 rewardPoints */}
    </Datagrid>
  </List>
);

export const RewardConfigEdit = () => (
  <Edit>
    <SimpleForm>
      {/* 将 level 字段设置为只读 */}
      <TextField source="level" label="Level" />
      <NumberInput source="rewardPoints" label="Reward Points" />
    </SimpleForm>
  </Edit>
);