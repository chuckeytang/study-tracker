import { useNotify, useRefresh, useRecordContext } from "react-admin";
import { Button } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import { apiRequest } from "@/utils/api";

const SetPublicButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;

  const isPublic = record.inHomePage === true;

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await apiRequest("/api/courses/setHomePageCourse", "POST", {
        courseId: record.id,
      });

      notify("The course has been set as a public course", { type: "success" });
      refresh();
    } catch (error: any) {
      console.error("Set public course error:", error);
      notify("Course set failed：" + error.message, { type: "error" });
    }
  };

  return isPublic ? (
    <span style={{ fontWeight: "bold", color: "#4caf50" }}>IN PUBLIC</span>
  ) : (
    <Button
      onClick={handleClick}
      startIcon={<PublicIcon />}
      color="primary"
      size="small"
    >
      PUBLIC
    </Button>
  );
};

export default SetPublicButton;
