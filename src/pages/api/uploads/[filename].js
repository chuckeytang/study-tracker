// pages/api/uploads/[filename].js
const fs = require("fs");
const path = require("path");

export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join(process.cwd(), "public/uploads", filename);

  if (fs.existsSync(filePath)) {
    // 根据文件扩展名设置 Content-Type
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream"; // 默认内容类型

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
      default:
        res.status(415).send("Unsupported Media Type");
        return;
    }

    res.setHeader("Content-Type", contentType);
    const file = fs.createReadStream(filePath);
    file.pipe(res);
  } else {
    res.status(404).send("File not found");
  }
}
