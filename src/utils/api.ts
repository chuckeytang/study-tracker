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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!notoken && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // 抛出异常，并包含状态码和错误信息
    const errorData = await response.json();
    throw new Error(`Error: ${response.status} - ${errorData.message}`);
  }
};
