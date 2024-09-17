import React, { useState } from "react";

const CourseEdit = (props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<File | null>(null);

  // 处理文件改变事件
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setIcon(event.target.files[0]); // 获取上传的文件
    }
  };

  // 表单提交事件处理
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 创建 FormData 对象，将表单字段和文件添加到其中
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (icon) {
      formData.append("icon", icon); // 将文件添加到 formData 中
    }

    try {
      // 使用 fetch 发送 POST 请求，将 FormData 传递到后端
      const response = await fetch("/api/courses/update", {
        method: "PUT",
        body: formData, // 发送 FormData
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Course updated successfully:", data);
        alert("Course updated successfully!");
      } else {
        console.error("Failed to update course");
        alert("Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="icon">Icon:</label>
        <input
          type="file"
          id="icon"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <button type="submit">Update Course</button>
    </form>
  );
};

export default CourseEdit;
