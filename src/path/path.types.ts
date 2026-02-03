import { AuthTokens } from "../auth/auth.types";

export type newPathRequest = {
  name: string;
  path: any;
};

export type deletePathRequest = {
  pathId: string;
};

export type newPathResponse = AuthTokens & {
   status: string;
   message: string;
};

export type SavePathRequest = {
  pathId: string;
};

export type ListQuery = {
  page?: number;
  limit?: number;
  q?: string;
};
