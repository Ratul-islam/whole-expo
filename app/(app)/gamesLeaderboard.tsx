import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { ScreenLayout } from "../../src/ui/app/screenLayout";
import { sessionService, type GamesLeaderboardItem } from "@/src/session/session.services";
import { useRouter } from "expo-router";

import { useResponsiveScale } from "@/hooks/useResponsiveScale";

function getInitials(name?: string) {
  if (!name || !name.trim()) return "?";
  return name.trim().substring(0, 2).toUpperCase();
}

function getAccuracy(correct: number, wrong: number) {
  const total = correct + wrong;
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function GamesLeaderboardScreen() {
  const router = useRouter();
  
  const scale = useResponsiveScale();
  const s = useMemo(() => getResponsiveStyles(scale), [scale]);

  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<GamesLeaderboardItem[]>([]);

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

      const res = await sessionService.getLeaderboard({
        page: p,
        limit,
        type: "games",
        boardConf: "20",
      });

      // The backend nests the actual content inside an inner 'data' object
      const payload = (res as any).data;

      if (res.status !== "success" || !payload || !Array.isArray(payload.data)) {
        throw new Error(res.message || "Failed to load players");
      }

      // Extract the array and the meta object correctly
      const rows = payload.data as GamesLeaderboardItem[];
      const meta = payload.meta;

      setHasNext(!!meta?.hasNext);
      setPage(meta?.page ?? p);
      setPlayers((prev) => (append ? [...prev, ...rows] : rows));
    } catch (e: any) {
      setErrorText(e?.message || "Could not load leaderboard.");
      if (!append) setPlayers([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setPage(1);
      setHasNext(false);
      setQuery("");
      await fetchLeaderboard({ page: 1, append: false });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard({ page: 1, append: false });
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (!hasNext || fetchingMore || query.trim()) return;
    setFetchingMore(true);
    await fetchLeaderboard({ page: page + 1, append: true });
    setFetchingMore(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;

    return players.filter((p) =>
      `${p.username || "Anonymous"} ${p.rank} ${p.totalScore} ${p.userId}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, players]);

  const showList = query ? filtered : players;

  const PlayerRankRow = ({ player }: { player: GamesLeaderboardItem }) => {
    let rankColor = "#111111"; 
    let badgeColor = "#F7F7F7"; 
    let borderColor = "#E3E3E3";
    
    if (player.rank === 1) { rankColor = "#D97706"; badgeColor = "rgba(217, 119, 6, 0.1)"; borderColor = "rgba(217, 119, 6, 0.35)"; } // Gold
    if (player.rank === 2) { rankColor = "#6B7280"; badgeColor = "rgba(107, 114, 128, 0.1)"; borderColor = "rgba(107, 114, 128, 0.35)"; } // Silver
    if (player.rank === 3) { rankColor = "#B45309"; badgeColor = "rgba(180, 83, 9, 0.1)"; borderColor = "rgba(180, 83, 9, 0.35)"; } // Bronze

    const accuracy = getAccuracy(player.totalCorrect, player.totalWrong);
    const isTop3 = player.rank <= 3;

    return (
      <Pressable
        onPress={() => router.push({ pathname: "/(app)/leaderboard-profile", params: { userId: player.userId } })}
        style={({ pressed }) => [
          s.playerCard,
          isTop3 && { borderColor, borderWidth: 1.5 },
          pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={s.playerCardLeft}>
          <View style={[s.rankBadge, { backgroundColor: badgeColor, borderColor: isTop3 ? borderColor : "#D9D9D9" }]}>
            <Text style={[s.rankBadgeText, { color: rankColor }]}>#{player.rank}</Text>
          </View>

          <View style={s.avatar}>
            <Text style={s.avatarText}>{getInitials(player.username)}</Text>
          </View>

          <View style={s.playerInfo}>
            <Text style={s.playerName} numberOfLines={1}>
              {player.username || "Anonymous"}
            </Text>
            <Text style={s.playerStats}>
              {player.gamesPlayed} Games • {accuracy}% Acc
            </Text>
          </View>
        </View>

        <View style={s.playerCardRight}>
          <Text style={s.scoreValue}>{formatNumber(player.totalScore)}</Text>
          <Text style={s.scoreLabel}>PTS</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenLayout title="" subtitle="">
      <View style={s.container}>
        
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </Pressable>
          <Text style={s.headerTitle}>GLOBAL RANKINGS</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111111" />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 140;
            if (nearBottom) onLoadMore();
          }}
          scrollEventThrottle={16}
          contentContainerStyle={s.scrollContent}
        >
          <View style={s.hero}>
            <Text style={s.heroTitle}>Top Players</Text>
            <Text style={s.heroSubtitle}>Ranked by total lifetime points</Text>

            <TextInput
              style={s.searchInput}
              placeholder="Search players by name..."
              placeholderTextColor="#A5A5A5"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {loading ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color="#111111" />
              <Text style={s.centerText}>Loading rankings…</Text>
            </View>
          ) : errorText ? (
            <View style={s.errBox}>
              <Text style={s.errTitle}>Couldn’t load leaderboard</Text>
              <Text style={s.errText}>{errorText}</Text>
              <Pressable onPress={() => fetchLeaderboard({ page: 1 })} style={s.errBtn}>
                <Text style={s.errBtnText}>Try Again</Text>
              </Pressable>
            </View>
          ) : showList.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No players found</Text>
              <Text style={s.emptySub}>{query ? "Try a different search term." : "No one has played yet!"}</Text>
            </View>
          ) : (
            <View style={s.listContainer}>
              {!query ? (
                <View style={s.topHint}>
                  <Text style={s.topHintText}>
                    Rankings update continuously based on total lifetime points.
                  </Text>
                </View>
              ) : null}

              {showList.map((p) => (
                <PlayerRankRow key={`${p.userId}-${p.rank}`} player={p} />
              ))}
            </View>
          )}

          {fetchingMore ? (
            <View style={s.loadMore}>
              <ActivityIndicator size="small" color="#111111" />
              <Text style={s.loadMoreText}>Loading more…</Text>
            </View>
          ) : null}

          <View style={{ height: scale(40) }} />
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const getResponsiveStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    scrollContent: { paddingHorizontal: s(16) },

    header: { 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: "space-between", 
      paddingVertical: s(12), 
      paddingHorizontal: s(16), 
      marginTop: s(6) 
    },
    backBtn: {
      width: s(40),
      height: s(40),
      borderRadius: s(12),
      backgroundColor: "#F7F7F7",
      borderWidth: 1,
      borderColor: "#D9D9D9",
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: { color: "#111111", fontSize: s(14), fontWeight: "700" },
    headerTitle: { color: "#111111", fontSize: s(12), fontWeight: "800", letterSpacing: 1.5 },

    hero: { 
      borderRadius: s(22), 
      padding: s(20), 
      backgroundColor: "#F7F7F7",
      borderWidth: 1, 
      borderColor: "#E3E3E3", 
      marginTop: s(10) 
    },
    heroTitle: { color: "#111111", fontSize: s(13), fontWeight: "800", letterSpacing: -0.3 },
    heroSubtitle: { color: "#6B6B6B", fontSize: s(10), fontWeight: "500", marginTop: s(4) },
    
    searchInput: {
      marginTop: s(16),
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#D9D9D9",
      borderRadius: s(16),
      paddingVertical: s(14),
      paddingHorizontal: s(16),
      color: "#111111",
      fontSize: s(10),
      fontWeight: "600",
    },

    listContainer: { marginTop: s(16), gap: s(12) },

    topHint: {
      paddingVertical: s(12),
      paddingHorizontal: s(14),
      borderRadius: s(16),
      borderWidth: 1,
      borderColor: "#E3E3E3",
      backgroundColor: "#F7F7F7",
      marginBottom: s(4),
    },
    topHintText: { color: "#6B6B6B", fontWeight: "500", lineHeight: s(20), fontSize: s(10) },

    // Error & Empty States
    center: { marginTop: s(60), alignItems: "center", gap: s(12) },
    centerText: { color: "#6B6B6B", fontWeight: "600", fontSize: s(11) },
    
    errBox: { marginTop: s(24), padding: s(20), borderRadius: s(18), backgroundColor: "rgba(225,85,114,0.08)", borderWidth: 1, borderColor: "rgba(225,85,114,0.28)", alignItems: "center", gap: s(10) },
    errTitle: { color: "#C44760", fontSize: s(16), fontWeight: "800" },
    errText: { color: "#111111", fontWeight: "600", textAlign: "center", fontSize: s(10) },
    errBtn: { marginTop: s(6), borderRadius: s(14), backgroundColor: "#111111", paddingVertical: s(12), paddingHorizontal: s(20) },
    errBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: s(10) },
    
    empty: { marginTop: s(24), padding: s(20), borderRadius: s(18), backgroundColor: "#F7F7F7", borderWidth: 1, borderColor: "#E3E3E3", alignItems: "center", gap: s(6) },
    emptyTitle: { color: "#111111", fontWeight: "800", fontSize: s(16) },
    emptySub: { color: "#6B6B6B", fontWeight: "500", textAlign: "center", fontSize: s(10) },

    loadMore: { marginTop: s(20), alignItems: "center", flexDirection: "row", justifyContent: "center", gap: s(8) },
    loadMoreText: { color: "#6B6B6B", fontWeight: "600", fontSize: s(10) },

    playerCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FFFFFF",
      borderRadius: s(18),
      borderWidth: 1,
      borderColor: "#E3E3E3",
      padding: s(14),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },

    playerCardLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingRight: s(10),
    },

    rankBadge: {
      width: s(38),
      height: s(38),
      borderRadius: s(12),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      marginRight: s(12),
    },

    rankBadgeText: {
      fontWeight: "800",
      fontSize: s(10),
    },

    avatar: {
      width: s(44),
      height: s(44),
      borderRadius: s(22),
      backgroundColor: "#111111",
      alignItems: "center",
      justifyContent: "center",
      marginRight: s(14),
    },

    avatarText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: s(15),
      letterSpacing: 1,
    },

    playerInfo: {
      flex: 1,
      justifyContent: "center",
    },

    playerName: {
      color: "#111111",
      fontWeight: "800",
      fontSize: s(12),
      marginBottom: s(4),
      letterSpacing: 0.2,
    },

    playerStats: {
      color: "#6B6B6B",
      fontWeight: "600",
      fontSize: s(12),
    },

    playerCardRight: {
      alignItems: "flex-end",
      justifyContent: "center",
    },

    scoreValue: {
      color: "#111111",
      fontWeight: "800",
      fontSize: s(13),
      letterSpacing: -0.5,
    },

    scoreLabel: {
      color: "#8A8A8A",
      fontWeight: "700",
      fontSize: s(10),
      marginTop: s(2),
    },
  });