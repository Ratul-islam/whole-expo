export type BoardType = "10" | "20";

export type HoleLayoutItem = {
  valueIndex: number;
  displayId: number;
  row: number;
  col: number;
};

export function normalizeBoardType(boardConf?: string | number): BoardType {
  const v = String(boardConf ?? "").trim().toLowerCase();

  if (v === "10" || v === "2x5" || v.includes("lite")) return "10";
  if (v === "20" || v === "4x5" || v.includes("nextpeg") || v.includes("full")) return "20";

  return "10";
}

export function getBoardLayout(type: BoardType): HoleLayoutItem[] {
  if (type === "10") {
    return [
      { valueIndex: 0, displayId: 1, row: 0, col: 1 },
      { valueIndex: 1, displayId: 2, row: 0, col: 2 },
      { valueIndex: 2, displayId: 3, row: 0, col: 3 },

      { valueIndex: 3, displayId: 4, row: 1, col: 0 },
      { valueIndex: 4, displayId: 5, row: 1, col: 1 },
      { valueIndex: 5, displayId: 6, row: 1, col: 2 },
      { valueIndex: 6, displayId: 7, row: 1, col: 3 },

      { valueIndex: 7, displayId: 8, row: 2, col: 1 },
      { valueIndex: 8, displayId: 9, row: 2, col: 2 },
      { valueIndex: 9, displayId: 10, row: 2, col: 3 },
    ];
  }

  return [
    { valueIndex: 0, displayId: 1, row: 0, col: 1 },
    { valueIndex: 1, displayId: 2, row: 0, col: 2 },
    { valueIndex: 2, displayId: 3, row: 0, col: 3 },

    { valueIndex: 3, displayId: 4, row: 1, col: 1 },
    { valueIndex: 4, displayId: 5, row: 1, col: 2 },
    { valueIndex: 5, displayId: 6, row: 1, col: 3 },
    { valueIndex: 6, displayId: 7, row: 1, col: 4 },

    { valueIndex: 7, displayId: 8, row: 2, col: 0 },
    { valueIndex: 8, displayId: 9, row: 2, col: 1 },
    { valueIndex: 9, displayId: 10, row: 2, col: 2 },
    { valueIndex: 10, displayId: 11, row: 2, col: 3 },
    { valueIndex: 11, displayId: 12, row: 2, col: 4 },
    { valueIndex: 12, displayId: 13, row: 2, col: 5 },

    { valueIndex: 13, displayId: 14, row: 3, col: 1 },
    { valueIndex: 14, displayId: 15, row: 3, col: 2 },
    { valueIndex: 15, displayId: 16, row: 3, col: 3 },
    { valueIndex: 16, displayId: 17, row: 3, col: 4 },

    { valueIndex: 17, displayId: 18, row: 4, col: 1 },
    { valueIndex: 18, displayId: 19, row: 4, col: 2 },
    { valueIndex: 19, displayId: 20, row: 4, col: 3 },
  ];
}

export function boardMeta(type: BoardType) {
  if (type === "10") {
    return {
      title: "NextPeg Lite",
      statusSuffix: "NextPeg",
      cols: 4,
      rows: 3,
    };
  }

  return {
    title: "NextPeg",
    statusSuffix: "NextPeg",
    cols: 6,
    rows: 5,
  };
}