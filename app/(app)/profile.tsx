import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenLayout } from "../../src/ui/app/screenLayout";
import { userService } from "@/src/user/user.service";

import { ui } from "@/src/ui/profile/profile.styles";
import { UserProfileResponse, ProfilePath } from "@/src/ui/profile/profile.types";
import { formatDate, formatTinyTime } from "@/src/ui/profile/profile.utils";

import {FloatingParticles} from "@/src/ui/profile/FloatingParticles";
import {AnimatedAvatar} from "@/src/ui/profile/AnimatedAvatar";
import {StatCard} from "@/src/ui/profile/StatCard";
import RecentGamesSection from "@/src/ui/profile/RecentGames";
import RoutesSection from "@/src/ui/profile/RouteSection";
import { PathBoardViewer } from "@/src/ui/profile/PathBoardViewer";


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
      <View style={ui.container}>
        <FloatingParticles />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" colors={["#8B5CF6"]} />
          }
          contentContainerStyle={ui.scrollContent}
        >
          {/* Header */}
          <View style={ui.header}>
            <Pressable onPress={() => router.back()} style={ui.backButton}>
              <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={ui.backButtonGradient}>
                <Text style={ui.backButtonText}>←</Text>
              </LinearGradient>
            </Pressable>
            <Text style={ui.headerTitle}>PLAYER PROFILE</Text>
            <View style={{ width: 48 }} />
          </View>

          {loading ? (
            <View style={ui.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={ui.loadingText}>Loading profile...</Text>
            </View>
          ) : errorText ? (
            <LinearGradient colors={["rgba(239, 68, 68, 0.15)", "rgba(239, 68, 68, 0.05)"]} style={ui.errorContainer}>
              <Text style={ui.errorIcon}>⚠️</Text>
              <Text style={ui.errorTitle}>Couldn&apos;t load profile</Text>
              <Text style={ui.errorText}>{errorText}</Text>
              <Pressable onPress={load} style={ui.retryButton}>
                <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={ui.retryButtonGradient}>
                  <Text style={ui.retryButtonText}>Try Again</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          ) : !profile ? (
            <View style={ui.emptyContainer}>
              <Text style={ui.emptyIcon}>👤</Text>
              <Text style={ui.emptyTitle}>Profile not found</Text>
            </View>
          ) : (
            <>
              {/* Hero */}
              <LinearGradient colors={["rgba(139, 92, 246, 0.15)", "rgba(99, 102, 241, 0.05)"]} style={ui.heroSection}>
                <View style={ui.heroGlow} />

                <AnimatedAvatar firstName={profile.user.firstName} lastName={profile.user.lastName} verified={!!profile.user.isVerified} />
                <Text style={ui.playerName}>{name}</Text>

                {profile.user.isVerified ? (
                  <View style={ui.verifiedTag}>
                    <Text style={ui.verifiedTagIcon}>✓</Text>
                    <Text style={ui.verifiedTagText}>VERIFIED PLAYER</Text>
                  </View>
                ) : (
                  <View style={ui.newPlayerTag}>
                    <Text style={ui.newPlayerTagText}>🎮 NEW PLAYER</Text>
                  </View>
                )}

                <View style={ui.scoreDisplay}>
                  <Text style={ui.scoreValue}>{stats?.totalScore?.toLocaleString() ?? 0}</Text>
                  <Text style={ui.scoreLabel}>TOTAL POINTS</Text>
                </View>

                <View style={ui.quickStats}>
                  <View style={ui.quickStat}>
                    <Text style={ui.quickStatValue}>{bestScore.toLocaleString()}</Text>
                    <Text style={ui.quickStatLabel}>Best Score</Text>
                  </View>
                  <View style={ui.quickStatDivider} />
                  <View style={ui.quickStat}>
                    <Text style={ui.quickStatValue}>{formatTinyTime(stats?.lastPlayedAt)}</Text>
                    <Text style={ui.quickStatLabel}>Last Active</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Stat Grid */}
              <View style={ui.statsGrid}>
                <StatCard icon="🎮" label="Games Played" value={stats?.gamesPlayed ?? 0} gradient={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.05)"]} />
                <StatCard icon="🎯" label="Accuracy" value={`${accuracy}%`} gradient={["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.05)"]} />
                <StatCard icon="✅" label="Correct" value={stats?.totalCorrect ?? 0} gradient={["rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0.05)"]} />
                <StatCard icon="❌" label="Wrong" value={stats?.totalWrong ?? 0} gradient={["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.05)"]} />
              </View>

              <RecentGamesSection games={games} />
              <RoutesSection paths={paths} onOpen={(p) => setViewingPath(p)} />

              <View style={ui.memberSince}>
                <Text style={ui.memberSinceText}>🌟 Member since {formatDate(profile.user.createdAt)}</Text>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <PathBoardViewer
          visible={!!viewingPath}
          path={viewingPath?.path || []}
          pathName={viewingPath?.name || "Untitled Route"}
          onClose={() => setViewingPath(null)}
        />
      </View>
    </ScreenLayout>
  );
}
