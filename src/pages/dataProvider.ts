import {
  fetchUtils,
  DataProvider,
  CreateResult,
  RaRecord,
  CreateParams,
} from "react-admin";
import { stringify } from "query-string";

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
      console.log("role:", role);

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

  getOne: async (resource, params) =>
    httpClient(`${apiUrl}/${resource}/getOne?id=${params.id}`).then(
      ({ json }) => ({
        data: json,
      })
    ),

  getMany: async (resource, params) => {
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
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url);
    return {
      data: json,
      total: json.length,
    };
  },

  update: async (resource, params) => {
    // 检查是否有文件需要上传
    if (Object.values(params.data).some(isFile)) {
      const formData = convertDataToFormData(params.data);
      const response = await fetch(`${apiUrl}/${resource}/update`, {
        method: "PUT",
        body: formData,
      });
      const json = await response.json();
      return { data: json };
    }

    return httpClient(`${apiUrl}/${resource}/update`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  updateMany: async (resource, params) => {
    // 检查是否有任何对象包含文件需要上传
    if (params.data.some((item: any) => Object.values(item).some(isFile))) {
      const formDataArray: FormData[] = params.data.map(convertDataToFormData);

      // 使用Promise.all处理多个并发请求
      const responses = await Promise.all(
        formDataArray.map((formData, index) =>
          fetch(`${apiUrl}/${resource}/update`, {
            method: "PUT",
            body: formData,
          })
        )
      );

      const jsonArray = await Promise.all(
        responses.map((response) => response.json())
      );

      return {
        data: jsonArray.map((json, index) => ({
          ...params.data[index],
          id: json.id,
        })),
      };
    }

    const query = {
      id: params.ids,
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  create: async <RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: CreateParams
  ) => {
    // 总是使用 FormData 即使没有文件
    const formData = new FormData();
    // 遍历 params.data，处理文件和其他字段
    Object.keys(params.data).forEach((key) => {
      const value = params.data[key];
      if (isFile(value)) {
        // 如果是文件，添加到 FormData
        formData.append(key, value.rawFile);
      } else {
        // 如果不是文件，作为普通字段添加到 FormData
        formData.append(key, value);
      }
    });

    // 发送 multipart/form-data 请求
    const response = await fetch(`${apiUrl}/${resource}/add`, {
      method: "POST",
      body: formData,
    });

    const json = await response.json();
    return {
      data: { ...params.data, id: json.id },
    } as CreateResult<RecordType>;
  },

  createMany: async <RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: { data: RecordType[] }
  ) => {
    // 检查是否有任何对象包含文件需要上传
    if (params.data.some((item) => Object.values(item).some(isFile))) {
      const formDataArray: FormData[] = params.data.map(convertDataToFormData);

      // 使用Promise.all处理多个并发请求
      const responses = await Promise.all(
        formDataArray.map((formData) =>
          fetch(`${apiUrl}/${resource}/createMany`, {
            method: "POST",
            body: formData,
          })
        )
      );

      const jsonArray = await Promise.all(
        responses.map((response) => response.json())
      );

      return {
        data: jsonArray.map((json, index) => ({
          ...params.data[index],
          id: json.id,
        })),
      } as unknown as CreateResult<RecordType>;
    }

    const url = `${apiUrl}/${resource}/createMany`;
    const options = {
      method: "POST",
      body: JSON.stringify(params.data),
    };
    const response = await httpClient(url, options);
    const json = await response.json;
    return {
      data: json.success.map((item: any, index: number) => ({
        ...params.data[index],
        id: item.id,
      })),
    } as CreateResult<RecordType>;
  },

  delete: async (resource, params) =>
    httpClient(`${apiUrl}/${resource}/delete`, {
      method: "DELETE",
      body: JSON.stringify(params),
    }).then(({ json }) => ({ data: json })),

  deleteMany: async (resource, params) => {
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
