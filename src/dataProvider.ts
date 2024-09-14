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

      const query = {
        _sort: field,
        _order: order,
        _start: (page - 1) * perPage,
        _end: page * perPage,
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

  update: async (resource, params) =>
    httpClient(`${apiUrl}/${resource}/update`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  updateMany: async (resource, params) => {
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
    const url = `${apiUrl}/${resource}/add`;
    const options = {
      method: "POST",
      body: JSON.stringify(params.data),
    };
    const response = await httpClient(url, options);
    const json = await response.json;
    return {
      data: { ...params.data, id: json.id },
    } as CreateResult<RecordType>;
  },

  createMany: async <RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: { data: RecordType[] }
  ) => {
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
