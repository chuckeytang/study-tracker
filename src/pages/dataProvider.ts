import {
  fetchUtils,
  DataProvider,
  CreateResult,
  RaRecord,
  CreateParams,
} from "react-admin";
import { stringify } from "query-string";
import { apiRequest } from "@/utils/api";

const apiUrl = "/api"; // 基础API URL
const httpClient = fetchUtils.fetchJson;

const isFile = (field: any) => {
  return field && field.rawFile;
};

const convertDataToFormData = (data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (isFile(data[key])) {
      formData.append(key, data[key].rawFile);
    } else {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    try {
      // 如果 params.pagination 为 undefined，提供默认值 { page: 1, perPage: 10 }
      const { page = 1, perPage = 10 } = params.pagination || {
        page: 1,
        perPage: 10,
      };

      // 如果 params.sort 为 undefined，提供默认值 { field: 'id', order: 'ASC' }
      const { field = "id", order = "ASC" } = params.sort || {
        field: "id",
        order: "ASC",
      };
      const { role, ...otherFilters } = params.filter || {}; // 从filter中提取role
      if (resource === "students" || resource === "teachers") {
        resource = "users";
      }

      const query = {
        _sort: field,
        _order: order,
        _start: (page - 1) * perPage,
        _end: page * perPage,
        ...(role ? { role } : {}), // 如果存在 role，则将其添加到查询条件中
        ...params.filter,
      };
      const url = `${apiUrl}/${resource}/search?${stringify(query)}`;
      const { json } = await httpClient(url);

      return {
        data: json.data, // 确保后端响应中有 data 字段
        total: json.total, // 确保后端返回 total 字段
      };
    } catch (error) {
      console.error("Error fetching data from getList:", error);
      throw error; // 抛出错误以便更好地处理
    }
  },

  getOne: async (resource, params) => {
    try {
      if (resource === "students" || resource === "teachers") {
        resource = "users";
      }

      const url = `${apiUrl}/${resource}/getOne?id=${params.id}`;
      const { json } = await httpClient(url);

      return {
        data: json,
      };
    } catch (error) {
      console.error("Error fetching data from getOne:", error);
      throw error; // 抛出错误以便更好地处理
    }
  },

  getMany: async (resource, params) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }
    const query = {
      id: params.ids,
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url);
    return { data: json };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _end: page * perPage,
      [params.target]: params.id,
      ...params.filter,
    };
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url);
    return {
      data: json,
      total: json.length,
    };
  },

  update: async (resource, params) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }
    // 检查是否有文件需要上传
    if (Object.values(params.data).some(isFile)) {
      const formData = convertDataToFormData(params.data);
      const data = await apiRequest(
        `${apiUrl}/${resource}/update`,
        "PUT",
        formData
      );
      return { data: data };
    }

    return httpClient(`${apiUrl}/${resource}/update`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  updateMany: async (resource, params) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }

    // 检查是否有任何对象包含文件需要上传
    if (params.data.some((item: any) => Object.values(item).some(isFile))) {
      const formDataArray: FormData[] = params.data.map(convertDataToFormData);

      // 使用Promise.all处理多个并发请求
      const responses = await Promise.all(
        formDataArray.map((formData, index) =>
          apiRequest(`${resource}/update`, "PUT", formData, true)
        )
      );

      return {
        data: responses.map((json, index) => ({
          ...params.data[index],
          id: json.id,
        })),
      };
    }

    const query = { id: params.ids };
    const url = `${resource}?${stringify(query)}`;
    const data = await apiRequest(url, "PUT", params.data);
    return { data };
  },

  create: async <RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: CreateParams
  ) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }

    const formData = new FormData();
    Object.keys(params.data).forEach((key) => {
      const value = params.data[key];
      if (isFile(value)) {
        formData.append(key, value.rawFile);
      } else {
        formData.append(key, value);
      }
    });

    const response = await apiRequest(
      `${resource}/add`,
      "POST",
      formData,
      true
    );
    return {
      data: { ...params.data, id: response.id },
    } as CreateResult<RecordType>;
  },

  createMany: async <RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: { data: RecordType[] }
  ) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }

    if (params.data.some((item) => Object.values(item).some(isFile))) {
      const formDataArray: FormData[] = params.data.map(convertDataToFormData);

      // 使用Promise.all处理多个并发请求
      const responses = await Promise.all(
        formDataArray.map((formData) =>
          apiRequest(`${resource}/createMany`, "POST", formData, true)
        )
      );

      return {
        data: responses.map((json, index) => ({
          ...params.data[index],
          id: json.id,
        })),
      } as unknown as CreateResult<RecordType>;
    }

    const response = await apiRequest(
      `${resource}/createMany`,
      "POST",
      params.data
    );
    return {
      data: response.success.map((item: any, index: number) => ({
        ...params.data[index],
        id: item.id,
      })),
    } as CreateResult<RecordType>;
  },

  delete: async (resource, params) => {
    try {
      if (resource === "students" || resource === "teachers") {
        resource = "users";
      }

      // 发起 DELETE 请求，删除指定的资源
      const url = `${apiUrl}/${resource}/delete`;
      const response = await httpClient(url, {
        method: "DELETE",
        body: JSON.stringify({ id: params.id }), // 确保只传递 ID 进行删除
      });

      const { json } = response;

      return {
        data: json,
      };
    } catch (error) {
      console.error("Error deleting data from delete:", error);
      throw error; // 抛出错误以便更好地处理
    }
  },

  deleteMany: async (resource, params) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }
    const query = {
      id: params.ids,
    };
    const url = `${apiUrl}/${resource}/deleteMany`;
    const { json } = await httpClient(url, {
      method: "DELETE",
      body: JSON.stringify({ ids: params.ids }),
    });
    return { data: params.ids };
  },
};

export default dataProvider;
