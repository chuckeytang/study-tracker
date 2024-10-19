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
      const { page = 1, perPage = 10 } = params.pagination || {
        page: 1,
        perPage: 10,
      };
      const { field = "id", order = "ASC" } = params.sort || {
        field: "id",
        order: "ASC",
      };
      const { role, ...otherFilters } = params.filter || {};

      if (resource === "students" || resource === "teachers") {
        resource = "users";
      }

      const query = {
        _sort: field,
        _order: order,
        _start: (page - 1) * perPage,
        _end: page * perPage,
        ...(role ? { role } : {}),
        ...otherFilters,
      };

      const url = `${apiUrl}/${resource}/search?${stringify(query)}`;
      const data = await apiRequest(url, "GET");

      return {
        data: data.data,
        total: data.total,
      };
    } catch (error) {
      console.error("Error fetching data from getList:", error);
      throw error;
    }
  },

  getOne: async (resource, params) => {
    try {
      if (resource === "students" || resource === "teachers") {
        resource = "users";
      }

      const url = `${apiUrl}/${resource}/getOne?id=${params.id}`;
      const data = await apiRequest(url, "GET");

      return {
        data: data,
      };
    } catch (error) {
      console.error("Error fetching data from getOne:", error);
      throw error;
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
    const data = await apiRequest(url, "GET");

    return { data: data };
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
    const data = await apiRequest(url, "GET");

    return {
      data: data,
      total: data.length,
    };
  },

  update: async (resource, params) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }

    const formData = convertDataToFormData(params.data);
    const data = await apiRequest(
      `${apiUrl}/${resource}/update`,
      "PUT",
      formData
    );
    return { data: data };
  },

  updateMany: async (resource, params) => {
    if (resource === "students" || resource === "teachers") {
      resource = "users";
    }

    const formDataArray: FormData[] = params.data.map(convertDataToFormData);

    // 使用Promise.all处理多个并发请求
    const responses = await Promise.all(
      formDataArray.map((formData, index) =>
        apiRequest(`${resource}/update`, "PUT", formData)
      )
    );

    return {
      data: responses.map((json, index) => ({
        ...params.data[index],
        id: json.id,
      })),
    };
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
      `${apiUrl}/${resource}/add`,
      "POST",
      formData
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

    const formDataArray: FormData[] = params.data.map(convertDataToFormData);

    // 使用Promise.all处理多个并发请求
    const responses = await Promise.all(
      formDataArray.map((formData) =>
        apiRequest(`${resource}/createMany`, "POST", formData)
      )
    );

    return {
      data: responses.map((json, index) => ({
        ...params.data[index],
        id: json.id,
      })),
    } as unknown as CreateResult<RecordType>;
  },

  delete: async (resource, params) => {
    try {
      if (resource === "students" || resource === "teachers") {
        resource = "users";
      }

      // 发起 DELETE 请求，删除指定的资源
      const url = `${apiUrl}/${resource}/delete`;
      const data = await apiRequest(url, "DELETE", { id: params.id }); // 传递 ID 进行删除

      return {
        data: data,
      };
    } catch (error) {
      console.error("Error deleting data from delete:", error);
      throw error; // 抛出错误以便更好地处理
    }
  },

  deleteMany: async (resource, params) => {
    try {
      if (resource === "students" || resource === "teachers") {
        resource = "users";
      }

      const url = `${apiUrl}/${resource}/deleteMany`;
      const data = await apiRequest(url, "DELETE", { ids: params.ids }); // 传递多个 ID 进行批量删除

      return { data: params.ids };
    } catch (error) {
      console.error("Error deleting data from deleteMany:", error);
      throw error; // 抛出错误以便更好地处理
    }
  },
};

export default dataProvider;
