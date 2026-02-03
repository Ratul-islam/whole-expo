export type Hand = "LEFT" | "RIGHT";

export type RouteDifficulty = "EASY" | "MEDIUM" | "HARD" | "PRO";

export type RouteMove = {
  moveNumber: number;
  holePosition: string; // ex: "A1", "B4", "12", etc (your peg board format)
  hand: Hand;
};

export type RouteProgram = {
  name: string; // optional label like "Program A"
  moves: RouteMove[];
};

export type RouteTopScore = {
  rank: 1 | 2 | 3;
  timeMs: number;
  score: number;
  playerName?: string;
};

export type Route = {
  id: string;
  fileName: string;
  createdBy: string;
  difficulty: RouteDifficulty;
  createdAtISO: string;

  numberOfMoves: number;
  programs: RouteProgram[];

  top3?: RouteTopScore[];

  // My Routes fields:
  isDownloaded?: boolean;
  isCreatedByMe?: boolean;
  bestTimeMs?: number | null;
  bestScore?: number | null;
};
