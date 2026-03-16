import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { ScreenLayout } from "../../src/ui/app/screenLayout";
import { sessionService } from "@/src/session/session.services";
import { useLocalSearchParams, useRouter } from "expo-router";

import GlowHeader from "@/src/ui/leaderboard/GlowHeader";
import SearchBar from "@/src/ui/leaderboard/SearchBar";
import StatusCard from "@/src/ui/leaderboard/StatusCard";
import PlayerRow from "@/src/ui/leaderboard/PlayerRow";

type PathLeaderboardItem = {
  pathId: string | { _id: string; name?: string };
  name?: string;
  plays: number;
  completed?: number;
  abandoned?: number;
  lastPlayedAt?: string | null;
  rank: number;
  boardConf?: string | number;
};

function normalizeBoardConf(value?: string | number): "10" | "20" {
  const v = String(value ?? "").trim().toLowerCase();

  if (v === "10" || v === "2x5" || v.includes("lite")) return "10";
  if (v === "20" || v === "4x5" || v.includes("nextpeg") || v.includes("full")) return "20";

  return "20";
}

function getBoardDisplayName(boardConf: "10" | "20") {
  return boardConf === "10" ? "NextPeg Lite" : "NextPeq";
}

function getPathIdString(p: PathLeaderboardItem["pathId"]) {
  return typeof p === "string" ? p : p?._id;
}

function getPathName(p: PathLeaderboardItem) {
  if (typeof p.pathId === "object" && p.pathId?.name) return p.pathId.name;
  if (p.name) return p.name;
  return `Path ${getPathIdString(p.pathId)?.slice?.(-6) ?? ""}`;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ boardConf?: string }>();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const ui = {
    contentPadding: isTablet ? 24 : 16,
    topGap: isTablet ? 14 : 10,
    sectionGap: isTablet ? 14 : 10,
    radius: isTablet ? 18 : 16,
  };

  const boardConf = useMemo(
    () => normalizeBoardConf(params.boardConf),
    [params.boardConf]
  );

  const boardTitle = getBoardDisplayName(boardConf);

  const [query, setQuery] = useState("");
  const [pathRows, setPathRows] = useState<PathLeaderboardItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 25;
  const [hasNext, setHasNext] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchLeaderboard = async (opts?: {
    page?: number;
    append?: boolean;
    nextBoardConf?: "10" | "20";
  }) => {
    const p = opts?.page ?? 1;
    const append = !!opts?.append;
    const nextBoardConf = opts?.nextBoardConf ?? boardConf;

    try {
      if (!append) setErrorText(null);

      const gg = await sessionService.getLeaderboard({
        page: p,
        limit,
        type: "path",
        boardConf: nextBoardConf,
      });

      const res = gg.data;

      if (!res || gg.status !== "success" || !Array.isArray((res as any).data)) {
        throw new Error((res as any)?.message || "Failed to load leaderboard");
      }

      const rows = (res as any).data as PathLeaderboardItem[];

      setHasNext(!!(res as any).meta?.hasNext);
      setPage((res as any).meta?.page ?? p);
      setPathRows((prev) => (append ? [...prev, ...rows] : rows));
    } catch (e: any) {
      setErrorText(e?.message || "Could not load leaderboard.");
      if (!append) setPathRows([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setPage(1);
      setHasNext(false);
      setQuery("");
      await fetchLeaderboard({ page: 1, append: false, nextBoardConf: boardConf });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardConf]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard({ page: 1, append: false, nextBoardConf: boardConf });
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (!hasNext || fetchingMore || query.trim()) return;
    setFetchingMore(true);
    await fetchLeaderboard({ page: page + 1, append: true, nextBoardConf: boardConf });
    setFetchingMore(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pathRows;

    return pathRows.filter((r) =>
      `${getPathName(r)} ${r.rank} ${r.plays} ${getPathIdString(r.pathId)}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, pathRows]);

  const showList = query ? filtered : pathRows;

  return (
    <ScreenLayout title="" subtitle="">
      <View style={s.container}>
        <View style={[s.topBar, { marginTop: ui.topGap, paddingHorizontal: ui.contentPadding }]}>
          <Pressable
            onPress={() => router.back()}
            style={[s.backBtn, { borderRadius: ui.radius }]}
          >
            <Text style={s.backIcon}>←</Text>
            <Text style={s.backText}>Back</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111111" />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const nearBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 140;
            if (nearBottom) onLoadMore();
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[
            s.content,
            {
              paddingHorizontal: ui.contentPadding,
            },
          ]}
        >
          <GlowHeader
            title="Path Leaderboard"
            subtitle={`${boardTitle} routes ranked by plays`}
          />

          <View style={[s.boardBadgeWrap, { marginTop: ui.topGap }]}>
            <View style={s.boardBadge}>
              <Text style={s.boardBadgeText}>{boardTitle}</Text>
            </View>
          </View>

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search paths by name or ID"
          />

          {loading ? (
            <StatusCard type="loading" message="Loading path rankings…" />
          ) : errorText ? (
            <StatusCard
              type="error"
              message={errorText}
              onRetry={() =>
                fetchLeaderboard({ page: 1, append: false, nextBoardConf: boardConf })
              }
            />
          ) : showList.length === 0 ? (
            <StatusCard
              type="empty"
              message={query ? "No matching paths found." : "No paths available yet."}
            />
          ) : (
            <View style={{ marginTop: 14, gap: ui.sectionGap }}>
              {!query ? (
                <View style={s.topHint}>
                  <Text style={s.topHintText}>
                    {boardTitle} paths are ordered by total plays from highest to lowest.
                  </Text>
                </View>
              ) : null}

              {showList.map((p, i) => (
  <PlayerRow
    key={`${getPathIdString(p.pathId)}-${p.rank}-${i}`}
    rank={p.rank}
    title={getPathName(p)}
    subtitle={getPathIdString(p.pathId) ? `ID ${getPathIdString(p.pathId)}` : "ID —"}
    value={p.plays}
    valueLabel="PLAYS"
    onPress={() =>
      router.push({
        pathname: "/(app)/leaderBoardPath",
        params: {
          pathId: getPathIdString(p.pathId),
        },
      })
    }
  />
))}
            </View>
          )}

          {fetchingMore ? (
            <View style={s.loadMore}>
              <Text style={s.loadMoreText}>Loading more…</Text>
            </View>
          ) : null}

          <View style={{ height: 34 }} />
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingBottom: 10,
  },

  topBar: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#F7F7F7",
  },

  backIcon: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },

  backText: {
    color: "#111111",
    fontWeight: "700",
  },

  boardBadgeWrap: {
    alignItems: "flex-start",
  },

  boardBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#111111",
    backgroundColor: "#111111",
  },

  boardBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  topHint: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    backgroundColor: "#F7F7F7",
  },

  topHintText: {
    color: "#6B6B6B",
    fontWeight: "500",
    lineHeight: 20,
  },

  loadMore: {
    marginTop: 16,
    alignItems: "center",
  },

  loadMoreText: {
    color: "#6B6B6B",
    fontWeight: "500",
  },
});