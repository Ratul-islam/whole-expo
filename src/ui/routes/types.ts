export type Tab = "CREATED" | "SAVED";
export type HandBit = 0 | 1;
export type PathStep = [number, HandBit];

export type PathDTO = {
  _id: string;
  userId: string;
  name: string;
  path: PathStep[];
  createdAt: string;
  updatedAt: string;
  isSaved?: boolean;
};

export type ApiMeta = { page?: number; limit?: number; total?: number; hasMore?: boolean };

export type ApiResponse = {
  status: "success" | "error";
  message: string;
  data: PathDTO[];
  meta?: ApiMeta;
};

export type RouteCardModel = {
  id: string;
  title: string;
  steps: number;
  createdAt?: string;
  path: PathStep[];
  isPublic: boolean
};

export type ConnectedDevice = { deviceId: string; deviceSecret: string } | null;
