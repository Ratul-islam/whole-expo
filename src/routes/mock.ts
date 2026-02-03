import { Route } from "./types";

export const mockLeaderboardRoutes: Route[] = [
  {
    id: "r1",
    fileName: "Fast Ladder v1",
    createdBy: "Alex",
    difficulty: "MEDIUM",
    createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    numberOfMoves: 18,
    programs: [
      {
        name: "Main",
        moves: [
          { moveNumber: 1, holePosition: "A1", hand: "RIGHT" },
          { moveNumber: 2, holePosition: "A2", hand: "RIGHT" },
        ],
      },
    ],
    top3: [
      { rank: 1, timeMs: 54210, score: 980, playerName: "Nora" },
      { rank: 2, timeMs: 58900, score: 940, playerName: "Sam" },
      { rank: 3, timeMs: 61200, score: 920, playerName: "Jin" },
    ],
  },
  {
    id: "r2",
    fileName: "Left-Hand Drill",
    createdBy: "Mira",
    difficulty: "HARD",
    createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    numberOfMoves: 25,
    programs: [{ name: "Main", moves: [{ moveNumber: 1, holePosition: "B2", hand: "LEFT" }] }],
    top3: [{ rank: 1, timeMs: 70200, score: 910, playerName: "Ali" }],
  },
];

export const mockMyRoutes: Route[] = [
  {
    id: "m1",
    fileName: "My Custom Route 01",
    createdBy: "Me",
    difficulty: "EASY",
    createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    numberOfMoves: 12,
    programs: [{ name: "Main", moves: [{ moveNumber: 1, holePosition: "C3", hand: "RIGHT" }] }],
    isDownloaded: true,
    isCreatedByMe: true,
    bestTimeMs: 45500,
    bestScore: 995,
  },
  {
    id: "m2",
    fileName: "Downloaded: Fast Ladder v1",
    createdBy: "Alex",
    difficulty: "MEDIUM",
    createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    numberOfMoves: 18,
    programs: [{ name: "Main", moves: [{ moveNumber: 1, holePosition: "A1", hand: "RIGHT" }] }],
    isDownloaded: true,
    isCreatedByMe: false,
    bestTimeMs: null,
    bestScore: null,
  },
];
