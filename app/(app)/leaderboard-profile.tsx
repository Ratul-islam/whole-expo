import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenLayout } from "../../src/ui/app/screenLayout";
import { userService } from "@/src/user/user.service";

import { AnimatedAvatar } from "@/src/ui/profile/AnimatedAvatar";
import { StatCard } from "@/src/ui/profile/StatCard";
import { GameCard, type ProfileSession } from "@/src/ui/profile/GameCard";
import { RouteCard, type ProfilePath } from "@/src/ui/profile/RouteCard";
import { PathBoardViewer, type PathStep } from "@/src/ui/profile/PathBoardViewer";


import { pathService } from "@/src/path/path.services";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";
import { GameDetailsModal } from "@/src/ui/app/GameDetailsModal";

type SessionStatus = "starting" | "preset_loaded" | "in_game" | "completed" | "abandoned";

type ProfileUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type UserProfileResponse = {
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
    paths: [ProfilePath & { userId: string; path: PathStep[] }];
    recentGames: [ProfileSession & { status: SessionStatus }];
  };
};

function formatTinyTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function LeaderboardProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = typeof params.userId === "string" ? params.userId : "";

  const scale = useResponsiveScale();
  const s = useMemo(() => getResponsiveStyles(scale), [scale]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse["data"] | null>(null);

  const [viewingPath, setViewingPath] = useState<ProfilePath | null>(null);
  
  const [selectedGame, setSelectedGame] = useState<ProfileSession | null>(null);

  const [savingBusy, setSavingBusy] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      setErrorText(null);
      const res = (await userService.PROFILE(userId)) as UserProfileResponse;
      if (!res || res.status !== "success" || !res.data?.user) {
        throw new Error(res?.message || "Failed to load profile");
      }
      setProfile(res.data);
    } catch (e: any) {
      setProfile(null);
      setErrorText(e?.message || "Could not load profile.");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const name = useMemo(() => {
    const u = profile?.user;
    if (!u) return "Player";
    return `${u.firstName} ${u.lastName}`.trim() || "Player";
  }, [profile]);

  const stats = profile?.stats;
  const paths = profile?.paths ?? [];
  const games = profile?.recentGames ?? [];

  const accuracy = useMemo(() => {
    const c = stats?.totalCorrect ?? 0;
    const w = stats?.totalWrong ?? 0;
    const total = c + w;
    if (total <= 0) return 0;
    return Math.round((c / total) * 100);
  }, [stats]);

  const bestScore = stats?.bestScore ?? 0;

  const ensureSavedState = async (pathId: string) => {
    if (savedMap[pathId] !== undefined) return;
    try {
      const res = await pathService.checkSavedPath(pathId);
      const isSaved = !!(res as any)?.data?.saved || !!(res as any)?.saved;
      setSavedMap((m) => ({ ...m, [pathId]: isSaved }));
    } catch {}
  };

  const toggleSave = async (pathId: string) => {
    setSavingBusy(true);
    try {
      const currentlySaved = !!savedMap[pathId];

      if (currentlySaved) {
        await pathService.deleteSavedPath(pathId);
        setSavedMap((m) => ({ ...m, [pathId]: false }));
      } else {
        await pathService.savePath({ pathId } as any);
        setSavedMap((m) => ({ ...m, [pathId]: true }));
      }
    } finally {
      setSavingBusy(false);
    }
  };

  return (
    <ScreenLayout title="" subtitle="">
      <View style={s.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#111111"
            />
          }
          contentContainerStyle={s.scrollContent}
        >
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <Text style={s.backText}>←</Text>
            </Pressable>
            <Text style={s.headerTitle}>PLAYER PROFILE</Text>
            <View style={{ width: scale(40) }} />
          </View>

          {loading ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color="#111111" />
              <Text style={s.centerText}>Loading profile…</Text>
            </View>
          ) : errorText ? (
            <View style={s.errBox}>
              <Text style={s.errTitle}>Couldn’t load profile</Text>
              <Text style={s.errText}>{errorText}</Text>
              <Pressable onPress={load} style={s.errBtn}>
                <Text style={s.errBtnText}>Try Again</Text>
              </Pressable>
            </View>
          ) : !profile ? (
            <View style={s.center}>
              <Text style={s.centerText}>Profile not found</Text>
            </View>
          ) : (
            <>
              <View style={s.hero}>
                <AnimatedAvatar
                  firstName={profile.user.firstName}
                  lastName={profile.user.lastName}
                  verified={!!profile.user.isVerified}
                />

                <Text style={s.name}>{name}</Text>

                <View style={[s.tag, profile.user.isVerified ? s.tagOk : s.tagNeutral]}>
                  <Text style={profile.user.isVerified ? s.tagTextOk : s.tagTextNeutral}>
                    {profile.user.isVerified ? "✓ VERIFIED" : "NEW PLAYER"}
                  </Text>
                </View>

                <View style={s.scoreBox}>
                  <Text style={s.score}>{stats?.totalScore?.toLocaleString() ?? 0}</Text>
                  <Text style={s.scoreLbl}>TOTAL POINTS</Text>
                </View>

                <View style={s.quickRow}>
                  <View style={s.quick}>
                    <Text style={s.quickVal}>{bestScore.toLocaleString()}</Text>
                    <Text style={s.quickLbl}>Best</Text>
                  </View>
                  <View style={s.quickDiv} />
                  <View style={s.quick}>
                    <Text style={s.quickVal}>{formatTinyTime(stats?.lastPlayedAt)}</Text>
                    <Text style={s.quickLbl}>Last active</Text>
                  </View>
                </View>
              </View>

              <View style={s.grid}>
                <StatCard icon="🎮" label="Games" value={stats?.gamesPlayed ?? 0}  />
                <StatCard icon="🎯" label="Accuracy" value={`${accuracy}%`}/>
                <StatCard icon="✅" label="Correct" value={stats?.totalCorrect ?? 0} />
                <StatCard icon="❌" label="Wrong" value={stats?.totalWrong ?? 0} />
              </View>

              <Section title="RECENT GAMES" count={games.length} s={s} scale={scale}>
                {games.length === 0 ? (
                  <Empty text="No games yet" sub="Games will appear here once played." s={s} />
                ) : (
                  <View style={{ gap: scale(10) }}>
                    {games.slice(0, 5).map((g, i) => (
                      // 3. Wrapped GameCard in a Pressable to trigger the modal
                      <Pressable 
                        key={g._id} 
                        onPress={() => setSelectedGame(g)}
                        style={({ pressed }) => [
                          pressed && { opacity: 0.7 }
                        ]}
                      >
                        <GameCard game={g} index={i} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </Section>

              <Section title="CREATED ROUTES" count={paths.length} s={s} scale={scale}>
                {paths.length === 0 ? (
                  <Empty text="No routes created" sub="This player hasn’t created any routes yet." s={s} />
                ) : (
                  <View style={{ gap: scale(10) }}>
                    {paths.slice(0, 5).map((r, i) => (
                      <RouteCard
                        key={r._id}
                        route={r}
                        index={i}
                        onPress={async () => {
                          setViewingPath(r);
                          await ensureSavedState(r._id);
                        }}
                      />
                    ))}
                  </View>
                )}
              </Section>

              <View style={s.member}>
                <Text style={s.memberText}>Member since {formatDate(profile.user.createdAt)}</Text>
              </View>
            </>
          )}

          <View style={{ height: scale(40) }} />
        </ScrollView>

        <PathBoardViewer
          context="LEADERBOARD"
          visible={!!viewingPath}
          path={(viewingPath?.path || []) as PathStep[]}
          pathName={viewingPath?.name || "Untitled Route"}
          boardConf={viewingPath?.boardConf}
          onClose={() => setViewingPath(null)}
          canSave={true}
          isSaved={viewingPath ? !!savedMap[viewingPath._id] : false}
          saveBusy={savingBusy}
          onSaveToggle={() => {
            if (!viewingPath) return;
            return toggleSave(viewingPath._id);
          }}
        />

        {/* 4. Render the modal sibling to your viewer */}
        <GameDetailsModal
          visible={!!selectedGame}
          game={selectedGame as any} 
          onClose={() => setSelectedGame(null)}
          onScanAgainLabel="CLOSE"
        />

      </View>
    </ScreenLayout>
  );
}

// --- SUB-COMPONENTS ---
function Section({ title, count, children, s, scale }: any) {
  return (
    <View style={{ marginTop: scale(24) }}>
      <View style={s.secHead}>
        <Text style={s.secTitle}>{title}</Text>
        <Text style={s.secCount}>{count}</Text>
      </View>
      {children}
    </View>
  );
}

function Empty({ text, sub, s }: any) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>{text}</Text>
      <Text style={s.emptySub}>{sub}</Text>
    </View>
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
    backText: { color: "#111111", fontSize: s(18), fontWeight: "700" },
    headerTitle: { color: "#111111", fontSize: s(14), fontWeight: "800", letterSpacing: 1.5 },

    center: { marginTop: s(90), alignItems: "center", gap: s(12) },
    centerText: { color: "#6B6B6B", fontWeight: "600", fontSize: s(14) },

    errBox: { marginTop: s(24), padding: s(20), borderRadius: s(18), backgroundColor: "rgba(225,85,114,0.08)", borderWidth: 1, borderColor: "rgba(225,85,114,0.28)", alignItems: "center", gap: s(10) },
    errTitle: { color: "#C44760", fontSize: s(16), fontWeight: "800" },
    errText: { color: "#111111", fontWeight: "600", textAlign: "center", fontSize: s(13) },
    errBtn: { marginTop: s(6), borderRadius: s(14), backgroundColor: "#111111", paddingVertical: s(12), paddingHorizontal: s(20) },
    errBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: s(13) },

    hero: { 
      borderRadius: s(22), 
      padding: s(22), 
      alignItems: "center", 
      backgroundColor: "#F7F7F7", 
      borderWidth: 1, 
      borderColor: "#E3E3E3", 
      marginTop: s(10) 
    },

    name: { marginTop: s(14), color: "#111111", fontSize: s(24), fontWeight: "800", letterSpacing: -0.3 },

    tag: { marginTop: s(8), paddingVertical: s(6), paddingHorizontal: s(12), borderRadius: s(12), borderWidth: 1 },
    tagOk: { backgroundColor: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)" },
    tagNeutral: { backgroundColor: "#EDEDED", borderColor: "#D9D9D9" },
    tagTextOk: { color: "#047857", fontWeight: "800", fontSize: s(11), letterSpacing: 0.5 },
    tagTextNeutral: { color: "#444444", fontWeight: "800", fontSize: s(11), letterSpacing: 0.5 },

    scoreBox: { marginTop: s(18), alignItems: "center" },
    score: { color: "#111111", fontSize: s(40), fontWeight: "800", letterSpacing: -1 },
    scoreLbl: { color: "#6B6B6B", fontSize: s(11), fontWeight: "700", letterSpacing: 1.5, marginTop: s(4) },

    quickRow: { marginTop: s(16), flexDirection: "row", alignItems: "center", gap: s(20) },
    quick: { alignItems: "center" },
    quickVal: { color: "#111111", fontSize: s(15), fontWeight: "800" },
    quickLbl: { color: "#8A8A8A", fontSize: s(11), fontWeight: "700", marginTop: s(2) },
    quickDiv: { width: 1, height: s(24), backgroundColor: "#D9D9D9" },

    grid: { marginTop: s(14), flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: s(10) },

    secHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: s(10) },
    secTitle: { color: "#111111", fontWeight: "800", fontSize: s(14), letterSpacing: 0.5 },
    secCount: { color: "#8A8A8A", fontWeight: "700", fontSize: s(14) },

    empty: { padding: s(18), borderRadius: s(16), backgroundColor: "#F7F7F7", borderWidth: 1, borderColor: "#E3E3E3", alignItems: "center", gap: s(6) },
    emptyTitle: { color: "#111111", fontWeight: "800", fontSize: s(14) },
    emptySub: { color: "#6B6B6B", fontWeight: "500", textAlign: "center", fontSize: s(13) },

    member: { marginTop: s(20), alignItems: "center" },
    memberText: { color: "#A5A5A5", fontWeight: "600", fontSize: s(12) },
  });