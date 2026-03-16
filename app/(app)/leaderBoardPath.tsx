import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenLayout } from "@/src/ui/app/screenLayout";
import StatusCard from "@/src/ui/leaderboard/StatusCard";
import { pathService } from "@/src/path/path.services";
import { PathBoardViewer } from "@/src/ui/profile/PathBoardViewer";

type HandBit = 0 | 1;
type PathStep = [number, HandBit];

type MatchItem = {
  _id?: string;
  sessionId?: string;
  score?: number;
  correct?: number;
  wrong?: number;
  time?: number;
  status?: string;
  createdAt?: string;
  endedAt?: string;
};

type PathModel = {
  _id: string;
  name: string;
  path: PathStep[];
  boardConf?: string | number;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

type MatchesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type PathDetailsPayload = {
  path: PathModel;
  matches: MatchItem[];
  meta: MatchesMeta;
};

function normalizeBoardConf(value?: string | number): "10" | "20" {
  const v = String(value ?? "").trim().toLowerCase();

  if (v === "10" || v === "2x5" || v.includes("lite")) return "10";
  if (v === "20" || v === "4x5" || v.includes("nextpeg") || v.includes("full")) return "20";

  return "20";
}

function getBoardDisplayName(boardConf?: string | number) {
  return normalizeBoardConf(boardConf) === "10" ? "NextPeg Lite" : "NextPeq";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeNum(value: any) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDuration(seconds?: number) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.floor(seconds);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export default function PathDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pathId?: string }>();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const ui = {
    pad: isTablet ? 20 : 16,
    radius: isTablet ? 18 : 16,
  };

  const pathId = useMemo(
    () => (typeof params.pathId === "string" ? params.pathId : ""),
    [params.pathId]
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [path, setPath] = useState<PathModel | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [meta, setMeta] = useState<MatchesMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [viewerOpen, setViewerOpen] = useState(true);

  const loadDetails = async (opts?: { page?: number; append?: boolean; silent?: boolean }) => {
    const nextPage = opts?.page ?? 1;
    const append = !!opts?.append;

    if (!pathId) {
      setErrorText("Missing path ID.");
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      return;
    }

    try {
      if (!append) {
        setErrorText(null);
      }

      const res = await pathService.getSinglePath({
        pathId,
        page: nextPage,
        limit: 10,
      });

      const payload: PathDetailsPayload = res?.data ?? res;

      if (!payload?.path) {
        throw new Error("Path details not found.");
      }

      setPath(payload.path);
      setMeta(
        payload.meta ?? {
          page: nextPage,
          limit: 10,
          total: Array.isArray(payload.matches) ? payload.matches.length : 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: nextPage > 1,
        }
      );

      const nextMatches = Array.isArray(payload.matches) ? payload.matches : [];
      setMatches((prev) => (append ? [...prev, ...nextMatches] : nextMatches));
    } catch (e: any) {
      setErrorText(e?.message || "Failed to load path details.");
      if (!append) {
        setPath(null);
        setMatches([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDetails({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetails({ page: 1 });
  };

  const onLoadMore = async () => {
    if (loadingMore || !meta.hasNext) return;
    setLoadingMore(true);
    await loadDetails({ page: meta.page + 1, append: true, silent: true });
  };

  const onSavePath = async () => {
    if (!path) return;

    try {
      setSaving(true);

      await pathService.savePath({
        pathId: path._id,
      });

      Alert.alert("Saved", "Path saved to your collection.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save path.");
    } finally {
      setSaving(false);
    }
  };

  const totalPlays = meta.total;
  const completedCount = matches.filter((m) => m.status === "completed").length;
  const bestScore = matches.reduce((best, m) => Math.max(best, safeNum(m.score)), 0);

  return (
    <ScreenLayout title="" subtitle="">
      <View style={s.container}>
        <View style={[s.topBar, { paddingHorizontal: ui.pad }]}>
          <Pressable onPress={() => router.back()} style={[s.backBtn, { borderRadius: ui.radius }]}>
            <Text style={s.backIcon}>←</Text>
            <Text style={s.backText}>Back</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111111" />
          }
          contentContainerStyle={{ paddingHorizontal: ui.pad, paddingBottom: 34 }}
        >
          {loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator color="#111111" />
              <Text style={s.loadingText}>Loading path details…</Text>
            </View>
          ) : errorText ? (
            <StatusCard
              type="error"
              message={errorText}
              onRetry={() => {
                setLoading(true);
                loadDetails({ page: 1 });
              }}
            />
          ) : !path ? (
            <StatusCard type="empty" message="No path details found." />
          ) : (
            <>
              <View style={s.heroCard}>
                <Text style={s.kicker}>Path Details</Text>
                <Text style={s.title}>{path.name || "Untitled Path"}</Text>
                <Text style={s.subtitle}>
                  {getBoardDisplayName(path.boardConf)} • {path.path?.length ?? 0} steps
                </Text>

                <View style={s.badgeRow}>
                  <View style={[s.badge, path.isPublic ? s.badgeDark : s.badgeLight]}>
                    <Text style={[s.badgeText, path.isPublic ? s.badgeTextDark : s.badgeTextLight]}>
                      {path.isPublic ? "PUBLIC" : "PRIVATE"}
                    </Text>
                  </View>

                  <View style={s.badgeLight}>
                    <Text style={s.badgeTextLight}>
                      {normalizeBoardConf(path.boardConf) === "10" ? "10 HOLES" : "20 HOLES"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={onSavePath}
                    disabled={saving}
                    style={({ pressed }) => [
                      s.saveBtn,
                      pressed && { opacity: 0.85 },
                      saving && { opacity: 0.6 },
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={s.saveBtnText}>Save Path</Text>
                    )}
                  </Pressable>
                </View>
              </View>

              <View style={s.sectionCard}>
                <Text style={s.sectionTitle}>Overview</Text>

                <View style={s.statsRow}>
                  <View style={s.statBox}>
                    <Text style={s.statValue}>{path.path?.length ?? 0}</Text>
                    <Text style={s.statLabel}>Steps</Text>
                  </View>

                  <View style={s.statBox}>
                    <Text style={s.statValue}>{totalPlays}</Text>
                    <Text style={s.statLabel}>Plays</Text>
                  </View>

                  <View style={s.statBox}>
                    <Text style={s.statValue}>{completedCount}</Text>
                    <Text style={s.statLabel}>Loaded Completed</Text>
                  </View>

                  <View style={s.statBox}>
                    <Text style={s.statValue}>{bestScore}</Text>
                    <Text style={s.statLabel}>Best Loaded Score</Text>
                  </View>
                </View>

                <View style={s.metaList}>
                  <View style={s.metaRow}>
                    <Text style={s.metaKey}>Created</Text>
                    <Text style={s.metaVal}>{formatDate(path.createdAt)}</Text>
                  </View>
                  <View style={s.metaRow}>
                    <Text style={s.metaKey}>Updated</Text>
                    <Text style={s.metaVal}>{formatDate(path.updatedAt)}</Text>
                  </View>
                  <View style={s.metaRow}>
                    <Text style={s.metaKey}>Path ID</Text>
                    <Text style={s.metaVal}>{path._id}</Text>
                  </View>
                  <View style={s.metaRow}>
                    <Text style={s.metaKey}>Matches Page</Text>
                    <Text style={s.metaVal}>
                      {meta.page} / {Math.max(meta.totalPages, 1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={s.sectionCard}>
                <View style={s.sectionHeadRow}>
                  <Text style={s.sectionTitle}>Preview</Text>

                  <Pressable onPress={() => setViewerOpen(true)} style={s.previewBtn}>
                    <Text style={s.previewBtnText}>Open Full Preview</Text>
                  </Pressable>
                </View>

                <Text style={s.previewHint}>
                  Tap the button to open the full path preview.
                </Text>
              </View>

              <View style={s.sectionCard}>
                <Text style={s.sectionTitle}>Match History</Text>

                {matches.length === 0 ? (
                  <Text style={s.emptyText}>No matches found for this path yet.</Text>
                ) : (
                  <>
                    <View style={s.matchList}>
                      {matches.map((match, index) => (
                        <View
                          key={match._id || match.sessionId || `match-${index}`}
                          style={s.matchCard}
                        >
                          <View style={s.matchTopRow}>
                            <Text style={s.matchStatus}>
                              {(match.status || "unknown").toUpperCase()}
                            </Text>
                            <Text style={s.matchScore}>{safeNum(match.score)} pts</Text>
                          </View>

                          <Text style={s.matchMeta}>
                            Time: {formatDuration(match.time)} • Correct: {safeNum(match.correct)} • Wrong: {safeNum(match.wrong)}
                          </Text>

                          <Text style={s.matchDate}>
                            {formatDate(match.endedAt || match.createdAt)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {meta.hasNext ? (
                      <Pressable
                        onPress={onLoadMore}
                        disabled={loadingMore}
                        style={[s.loadMoreBtn, loadingMore && s.loadMoreBtnDisabled]}
                      >
                        {loadingMore ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={s.loadMoreBtnText}>Load More Matches</Text>
                        )}
                      </Pressable>
                    ) : meta.total > 0 ? (
                      <Text style={s.endText}>All matches loaded</Text>
                    ) : null}
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {path ? (
          <PathBoardViewer
            visible={viewerOpen}
            path={path.path || []}
            pathName={path.name || "Path Preview"}
            boardConf={path.boardConf}
            onClose={() => setViewerOpen(false)}
            context="LEADERBOARD"
            canSave={false}
          />
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  topBar: {
    marginTop: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
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

  loadingWrap: {
    paddingTop: 40,
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    color: "#6B6B6B",
    fontWeight: "500",
  },

  heroCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    marginTop: 6,
  },

  kicker: {
    color: "#6B6B6B",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },

  title: {
    marginTop: 8,
    color: "#111111",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 8,
    color: "#6B6B6B",
    fontSize: 14,
    fontWeight: "500",
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },

  badge: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },

  badgeDark: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  badgeLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9D9D9",
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
  },

  badgeText: {
    fontWeight: "700",
    letterSpacing: 0.6,
    fontSize: 12,
  },

  badgeTextDark: {
    color: "#FFFFFF",
  },

  badgeTextLight: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.6,
    fontSize: 12,
  },

  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 104,
  },

  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  sectionCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  sectionTitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  previewBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
  },

  previewBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  previewHint: {
    marginTop: 10,
    color: "#6B6B6B",
    fontWeight: "500",
    lineHeight: 20,
  },

  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statBox: {
    flexGrow: 1,
    minWidth: 120,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  statValue: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "700",
  },

  statLabel: {
    marginTop: 4,
    color: "#6B6B6B",
    fontSize: 12,
    fontWeight: "500",
  },

  metaList: {
    marginTop: 14,
    gap: 10,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  metaKey: {
    color: "#6B6B6B",
    fontWeight: "600",
    flex: 0.9,
  },

  metaVal: {
    color: "#111111",
    fontWeight: "600",
    flex: 1.2,
    textAlign: "right",
  },

  emptyText: {
    marginTop: 12,
    color: "#6B6B6B",
    fontWeight: "500",
  },

  matchList: {
    marginTop: 12,
    gap: 10,
  },

  matchCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  matchTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },

  matchStatus: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.8,
  },

  matchScore: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 14,
  },

  matchMeta: {
    marginTop: 8,
    color: "#6B6B6B",
    fontWeight: "500",
  },

  matchDate: {
    marginTop: 6,
    color: "#8A8A8A",
    fontWeight: "500",
    fontSize: 12,
  },

  loadMoreBtn: {
    marginTop: 14,
    alignSelf: "center",
    minWidth: 170,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  loadMoreBtnDisabled: {
    opacity: 0.65,
  },

  loadMoreBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  endText: {
    marginTop: 14,
    textAlign: "center",
    color: "#8A8A8A",
    fontWeight: "500",
  },
});