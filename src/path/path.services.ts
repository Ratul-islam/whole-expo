import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  deletePathRequest,
  newPathRequest,
  newPathResponse,
  SavePathRequest,
  ListQuery,
  UpdatePathRequest,
} from "./path.types";


export const pathService = {
  addNewPath: async (payload: newPathRequest) => {
    const { data } = await api.post<newPathResponse>(ENDPOINTS.PATH.NEW, payload);
    return data;
  },

  deletePath: async (payload: deletePathRequest) => {
    const { data } = await api.delete(ENDPOINTS.PATH.DELETE, { data: payload });
    return data;
  },

  getAllPath: async (params?: ListQuery) => {
    const { data } = await api.get(ENDPOINTS.PATH.ALLPATH, { params });
    return data;
  },

  updatePath: async (payload: UpdatePathRequest) => {
    const { data } = await api.patch(ENDPOINTS.PATH.UPDATE, payload);
    return data;
  },

  savePath: async (payload: SavePathRequest) => {
    const { data } = await api.post(ENDPOINTS.PATH.SAVEPATH, payload);
    return data;
  },

  deleteSavedPath: async (pathId: string) => {
    const url = `${ENDPOINTS.PATH.DELETESAVEPATH}/${encodeURIComponent(pathId)}`;
    const { data } = await api.delete(url);
    return data;
  },

  getSavedPaths: async (params?: ListQuery) => {
    const { data } = await api.get(ENDPOINTS.PATH.GETSAVEPATH, { params });
    return data;
  },

  checkSavedPath: async (pathId: string) => {
    const url = ENDPOINTS.PATH.CHEKSAVEPATH.replace(":pathId", encodeURIComponent(pathId));
    const { data } = await api.get(url);
    return data;
  },
};