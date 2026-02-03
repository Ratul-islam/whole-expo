import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

type LeaderboardQuery = {
  page?: number;
  limit?: number;
};

type LeaderboardItem = {
  userId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  lastPlayedAt: string | null;
  rank: number;
};

type LeaderboardResponse = {
  status: "success" | "error";
  message: string;
  data: LeaderboardItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const sessionService = {
  start: async (payload: any) => {
    const { data } = await api.post(
      ENDPOINTS.SESSION.START,
      payload
    );
    return data;
  },

  getCompletedSessions: async () => {
    const { data } = await api.get(
      ENDPOINTS.SESSION.COMPLETEDSESSION
    );
    return data;
  },

  getLeaderboard: async ({
    page = 1,
    limit = 10,
  }: LeaderboardQuery = {}): Promise<LeaderboardResponse> => {
    const { data } = await api.get<LeaderboardResponse>(
      ENDPOINTS.SESSION.LEADERBOARD,
      {
        params: {
          page,
          limit,
        },
      }
    );

    return data;
  },
};
