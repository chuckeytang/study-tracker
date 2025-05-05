// CopyCourseButton.tsx
import {
  useNotify,
  useRefresh,
  useRedirect,
  useRecordContext,
} from "react-admin";
import { Button } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { apiRequest } from "@/utils/api";

const CopyCourseButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  if (!record) return null;

  const handleClick = async () => {
    try {
      const response = await apiRequest(`/api/courses/copyCourse`, "POST", {
        courseId: record.id,
      });
      notify("Course copied successfully", { type: "success" });
      refresh();
      redirect(`/admin/courses/${response.data.id}`);
    } catch (error: any) {
      console.error("Copy course error:", error);
      notify("Failed to copy course", { type: "error" });
    }
  };

  return (
    <Button
      onClick={handleClick}
      startIcon={<ContentCopyIcon />}
      size="small"
      color="primary"
    >
      Copy From
    </Button>
  );
};

export default CopyCourseButton;
