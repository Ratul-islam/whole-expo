import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenLayout } from "../../src/ui/app/screenLayout";
import { userService } from "@/src/user/user.service";

import { AnimatedAvatar } from "@/src/ui/profile/AnimatedAvatar";
import { StatCard } from "@/src/ui/profile/StatCard";
import { GameCard, type ProfileSession } from "@/src/ui/profile/GameCard";
import { RouteCard, type ProfilePath } from "@/src/ui/profile/RouteCard";
import { PathBoardViewer, type PathStep } from "@/src/ui/profile/PathBoardViewer";
import  {FloatingParticles}  from "@/src/ui/profile/FloatingParticles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
    paths: Array<ProfilePath & { userId: string; path: PathStep[] }>;
    recentGames: Array<ProfileSession & { status: SessionStatus }>;
  };
};

function formatTinyTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse["data"] | null>(null);

  const [viewingPath, setViewingPath] = useState<ProfilePath | null>(null);

  const load = async () => {
    try {
      setErrorText(null);
      const res = (await userService.PROFILE(userId)) as UserProfileResponse;
      if (!res || res.status !== "success" || !res.data?.user) throw new Error(res?.message || "Failed to load profile");
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

  return (
    <ScreenLayout title="" subtitle="">
      <View style={s.container}>
        <FloatingParticles />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" colors={["#8B5CF6"]} />}
          contentContainerStyle={s.scrollContent}
        >
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <LinearGradient colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.05)"]} style={s.backBtnGrad}>
                <Text style={s.backText}>←</Text>
              </LinearGradient>
            </Pressable>
            <Text style={s.headerTitle}>PLAYER PROFILE</Text>
            <View style={{ width: 48 }} />
          </View>

          {loading ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={s.centerText}>Loading…</Text>
            </View>
          ) : errorText ? (
            <LinearGradient colors={["rgba(239, 68, 68, 0.15)", "rgba(239, 68, 68, 0.05)"]} style={s.errBox}>
              <Text style={s.errTitle}>Couldn’t load profile</Text>
              <Text style={s.errText}>{errorText}</Text>
              <Pressable onPress={load} style={s.errBtn}>
                <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={s.errBtnGrad}>
                  <Text style={s.errBtnText}>Try Again</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          ) : !profile ? (
            <View style={s.center}>
              <Text style={s.centerText}>Profile not found</Text>
            </View>
          ) : (
            <>
              <LinearGradient colors={["rgba(139, 92, 246, 0.15)", "rgba(99, 102, 241, 0.05)"]} style={s.hero}>
                <View style={s.heroGlow} />

                <AnimatedAvatar firstName={profile.user.firstName} lastName={profile.user.lastName} verified={!!profile.user.isVerified} />

                <Text style={s.name}>{name}</Text>

                <View style={[s.tag, profile.user.isVerified ? s.tagOk : s.tagNeutral]}>
                  <Text style={s.tagText}>{profile.user.isVerified ? "✓ VERIFIED" : "NEW PLAYER"}</Text>
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
              </LinearGradient>

              <View style={s.grid}>
                <StatCard icon="🎮" label="Games" value={stats?.gamesPlayed ?? 0} gradient={["rgba(59,130,246,0.20)", "rgba(59,130,246,0.05)"]} />
                <StatCard icon="🎯" label="Accuracy" value={`${accuracy}%`} gradient={["rgba(16,185,129,0.20)", "rgba(16,185,129,0.05)"]} />
                <StatCard icon="✅" label="Correct" value={stats?.totalCorrect ?? 0} gradient={["rgba(34,197,94,0.20)", "rgba(34,197,94,0.05)"]} />
                <StatCard icon="❌" label="Wrong" value={stats?.totalWrong ?? 0} gradient={["rgba(239,68,68,0.20)", "rgba(239,68,68,0.05)"]} />
              </View>

              <Section title="RECENT GAMES" count={games.length}>
                {games.length === 0 ? (
                  <Empty text="No games yet" sub="Games will appear here once played." />
                ) : (
                  <View style={{ gap: 10 }}>
                    {games.slice(0, 5).map((g, i) => (
                      <GameCard key={g._id} game={g} index={i} />
                    ))}
                  </View>
                )}
              </Section>

              <Section title="CREATED ROUTES" count={paths.length}>
                {paths.length === 0 ? (
                  <Empty text="No routes created" sub="This player hasn’t created any routes yet." />
                ) : (
                  <View style={{ gap: 10 }}>
                    {paths.slice(0, 5).map((r, i) => (
                      <RouteCard key={r._id} route={r} index={i} onPress={() => setViewingPath(r)} />
                    ))}
                  </View>
                )}
              </Section>

              <View style={s.member}>
                <Text style={s.memberText}>Member since {formatDate(profile.user.createdAt)}</Text>
              </View>
            </>
          )}

          <View style={{ height: 34 }} />
        </ScrollView>

        <PathBoardViewer
          visible={!!viewingPath}
          path={(viewingPath?.path || []) as PathStep[]}
          pathName={viewingPath?.name || "Untitled Route"}
          onClose={() => setViewingPath(null)}
        />
      </View>
    </ScreenLayout>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <View style={s.secHead}>
        <Text style={s.secTitle}>{title}</Text>
        <Text style={s.secCount}>{count}</Text>
      </View>
      {children}
    </View>
  );
}

function Empty({ text, sub }: { text: string; sub: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>{text}</Text>
      <Text style={s.emptySub}>{sub}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  scrollContent: { paddingHorizontal: 16 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  backBtn: { borderRadius: 14, overflow: "hidden" },
  backBtnGrad: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  backText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 2 },

  center: { marginTop: 90, alignItems: "center", gap: 12 },
  centerText: { color: "rgba(255,255,255,0.7)", fontWeight: "800" },

  errBox: { marginTop: 24, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)", alignItems: "center", gap: 10 },
  errTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  errText: { color: "rgba(255,255,255,0.7)", fontWeight: "700", textAlign: "center" },
  errBtn: { marginTop: 6, borderRadius: 12, overflow: "hidden" },
  errBtnGrad: { paddingVertical: 12, paddingHorizontal: 18 },
  errBtnText: { color: "#fff", fontWeight: "900" },

  hero: { borderRadius: 24, padding: 22, alignItems: "center", borderWidth: 1, borderColor: "rgba(139, 92, 246, 0.28)", overflow: "hidden" },
  heroGlow: { position: "absolute", top: -110, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(139, 92, 246, 0.18)" },

  name: { marginTop: 14, color: "#fff", fontSize: 26, fontWeight: "900" },

  tag: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  tagOk: { backgroundColor: "rgba(16,185,129,0.16)", borderColor: "rgba(16,185,129,0.35)" },
  tagNeutral: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.10)" },
  tagText: { color: "rgba(255,255,255,0.85)", fontWeight: "900", letterSpacing: 1 },

  scoreBox: { marginTop: 18, alignItems: "center" },
  score: { color: "#fff", fontSize: 44, fontWeight: "900" },
  scoreLbl: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "900", letterSpacing: 2, marginTop: 4 },

  quickRow: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 20 },
  quick: { alignItems: "center" },
  quickVal: { color: "#fff", fontSize: 15, fontWeight: "900" },
  quickLbl: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "800", marginTop: 2 },
  quickDiv: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.18)" },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },

  secHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  secTitle: { color: "#fff", fontWeight: "900", letterSpacing: 1.6 },
  secCount: { color: "rgba(255,255,255,0.55)", fontWeight: "800" },

  empty: { padding: 18, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", alignItems: "center", gap: 6 },
  emptyTitle: { color: "rgba(255,255,255,0.85)", fontWeight: "900" },
  emptySub: { color: "rgba(255,255,255,0.55)", fontWeight: "700", textAlign: "center" },

  member: { marginTop: 20, alignItems: "center" },
  memberText: { color: "rgba(255,255,255,0.45)", fontWeight: "700" },
});
