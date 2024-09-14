import { useParams } from "react-router-dom";
import { Card, CardContent, Typography } from "@mui/material";

const DesignPage = () => {
  const { id } = useParams(); // 获取课程ID

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Design Course</Typography>
        <Typography variant="body1">
          You are designing course with ID: {id}
        </Typography>
        {/* 此处可以替换为后续的设计页面内容 */}
      </CardContent>
    </Card>
  );
};

export default DesignPage;
