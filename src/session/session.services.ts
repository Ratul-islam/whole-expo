import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export type LeaderboardType = "games" | "path";

export type LeaderboardQuery = {
  page?: number;
  limit?: number;
  type?: LeaderboardType;
  boardConf: string;
};

export type GamesLeaderboardItem = {
  userId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  lastPlayedAt: string | null;
  rank: number;
};

export type LeaderboardMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type GamesLeaderboardResponse = {
  status: "success" | "error";
  message: string;
  data: GamesLeaderboardItem[];
  meta: LeaderboardMeta;
};


export type PathLeaderboardItem = {
  pathId: string; 
  name?: string;
  plays: number;
  completed?: number;
  abandoned?: number;
  lastPlayedAt?: string | null;
  rank: number;
};

export type PathLeaderboardResponse = {
  status: "success" | "error";
  message: string;
  data: PathLeaderboardItem[];
  meta: LeaderboardMeta;
};

export type LeaderboardResponse = GamesLeaderboardResponse | PathLeaderboardResponse;

export const sessionService = {
  start: async (payload: any) => {
    const { data } = await api.post(ENDPOINTS.SESSION.START, payload);
    return data;
  },

  getCompletedSessions: async () => {
    const { data } = await api.get(ENDPOINTS.SESSION.COMPLETEDSESSION);
    return data;
  },

  
  getLeaderboard: async ({
    page = 1,
    limit = 10,
    boardConf,
    type = "games",
  }: LeaderboardQuery): Promise<LeaderboardResponse> => {
    const { data } = await api.get<LeaderboardResponse>(
      ENDPOINTS.SESSION.LEADERBOARD,
      {
        params: { page, limit, type, boardConf },
      }
    );
    return data;
  },
};
