export type SessionStatus =
  | "starting"
  | "preset_loaded"
  | "in_game"
  | "completed"
  | "abandoned";

export type ProfileUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HandBit = 0 | 1;
export type PathStep = [number, HandBit];

export type ProfilePath = {
  _id: string;
  userId: string;
  name?: string;
  path: PathStep[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProfileSession = {
  _id: string;
  sessionId: string;
  userId: string;
  deviceId: string;
  deviceSecret: string;
  status: SessionStatus;
  score: number;
  correct: number;
  wrong: number;
  startedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserProfileResponse = {
  status: "success" | "error";
  message?: string;
  data: {
    user: ProfileUser;
    stats: {
      gamesPlayed: number;
      totalScore: number;
      totalCorrect: number;
      totalWrong: number;
      bestScore?: number;
      lastPlayedAt?: string | null;
    };
    paths: ProfilePath[];
    recentGames: ProfileSession[];
  };
};
