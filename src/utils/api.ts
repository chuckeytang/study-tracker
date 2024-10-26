const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  // 从 localStorage 获取存储的 Bearer 令牌
  return localStorage.getItem("token");
};
export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  body: any = null,
  notoken: boolean = false
) => {
  const token = getAuthToken(); // 获取 Bearer 令牌
  const headers: Record<string, string> = {};

  // 如果有 token 并且不为 noToken 模式，添加 Authorization 头
  if (!notoken && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      // 如果 body 是 FormData，则不设置 Content-Type，因为浏览器会自动处理
      fetchOptions.body = body;
    } else {
      // 否则假设是 JSON 数据
      headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // 抛出异常，并包含状态码和错误信息
    const errorData = await response.json();
    throw new Error(`Error: ${response.status} - ${errorData.message}`);
  }
};
