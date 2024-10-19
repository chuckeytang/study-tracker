import { User } from "@prisma/client";
import { NextApiRequest } from "next";
// 自定义文件类型
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// 扩展 NextApiRequest 类型，增加 file 和 files 属性
export interface ExtendedNextApiRequest extends NextApiRequest {
  file?: MulterFile;
  files?: MulterFile[];
  user: User;
}
