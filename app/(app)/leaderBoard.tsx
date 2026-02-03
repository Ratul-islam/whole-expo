import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Text, Pressable } from "react-native";
import { ScreenLayout } from "../../src/ui/app/screenLayout";
import { sessionService } from "@/src/session/session.services";
import { useRouter } from "expo-router";

import GlowHeader from "@/src/ui/leaderboard/GlowHeader";
import SearchBar from "@/src/ui/leaderboard/SearchBar";
import PlayerRow, { LeaderboardItem } from "@/src/ui/leaderboard/PlayerRow";
import StatusCard from "@/src/ui/leaderboard/StatusCard";
import { FloatingParticles } from "@/src/ui/profile/FloatingParticles";



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

export default function LeaderboardScreen() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 25;
  const [hasNext, setHasNext] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchLeaderboard = async (opts?: { page?: number; append?: boolean }) => {
    const p = opts?.page ?? 1;
    const append = !!opts?.append;

    try {
      if (!append) setErrorText(null);

      const res = (await sessionService.getLeaderboard({ page: p, limit })) as LeaderboardResponse;

      if (!res || res.status !== "success" || !Array.isArray(res.data)) {
        throw new Error(res?.message || "Failed to load leaderboard");
      }

      setHasNext(!!res.meta?.hasNext);
      setPage(res.meta?.page ?? p);

      setRows((prev) => (append ? [...prev, ...res.data] : res.data));
    } catch (e: any) {
      setErrorText(e?.message || "Could not load leaderboard.");
      if (!append) setRows([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchLeaderboard({ page: 1, append: false });
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard({ page: 1, append: false });
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (!hasNext || fetchingMore) return;
    setFetchingMore(true);
    await fetchLeaderboard({ page: page + 1, append: true });
    setFetchingMore(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.username} ${r.rank} ${r.totalScore}`.toLowerCase().includes(q));
  }, [query, rows]);

  const showList = query ? filtered : rows;

  return (
    <ScreenLayout title="" subtitle="">
      <View style={s.container}>
        <View style={s.topBar}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
            <Text style={s.backText}>Back</Text>
          </Pressable>
        </View>
        <FloatingParticles count={10} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 140;
            if (nearBottom) onLoadMore();
          }}
          scrollEventThrottle={16}
          contentContainerStyle={s.content}
        >
          <GlowHeader />
          <SearchBar value={query} onChange={setQuery} />

          {loading ? (
            <StatusCard type="loading" message="Loading rankings…" />
          ) : errorText ? (
            <StatusCard
              type="error"
              message={errorText}
              onRetry={() => fetchLeaderboard({ page: 1, append: false })}
            />
          ) : showList.length === 0 ? (
            <StatusCard type="empty" message={query ? "No players found." : "No players yet."} />
          ) : (
            <View style={{ marginTop: 14, gap: 10 }}>
              {!query && (
                <View style={s.topHint}>
                  <Text style={s.topHintText}>Top ranks update from completed games.</Text>
                </View>
              )}

              {showList.map((p, i) => (
                <PlayerRow
                  key={`${p.userId}-${p.rank}-${i}`}
                  player={p}
                  index={i}
                  onPress={() =>
                    router.push({ pathname: "/(app)/leaderboard-profile", params: { userId: p.userId } })
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
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  content: { paddingHorizontal: 16 },
  topHint: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  topHintText: { color: "rgba(255,255,255,0.60)", fontWeight: "700" },
  loadMore: { marginTop: 16, alignItems: "center" },
  loadMoreText: { color: "rgba(255,255,255,0.65)", fontWeight: "800" },
  topBar: {
  marginTop: 8,
  marginLeft: 14,
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
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  backgroundColor: "rgba(255,255,255,0.05)",
},
backIcon: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "900",
},
backText: {
  color: "rgba(255,255,255,0.85)",
  fontWeight: "900",
},

});
