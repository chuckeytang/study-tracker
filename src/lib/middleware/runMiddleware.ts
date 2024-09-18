import { NextApiRequest, NextApiResponse } from "next";

// 通用函数：运行中间件
export const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: any
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};
