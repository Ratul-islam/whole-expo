import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ui = StyleSheet.create({
    
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  backButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  backButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },

  // Loading
  loadingContainer: {
    marginTop: 100,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    fontSize: 16,
  },

  // Error
  errorContainer: {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    alignItems: "center",
    gap: 12,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  errorText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  retryButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  // Empty
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    fontSize: 60,
    opacity: 0.5,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontWeight: "700",
  },

  // Hero Section
  heroSection: {
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    overflow: "hidden",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },

  // Avatar
  avatarContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
  },
  avatarRingGradient: {
    flex: 1,
    borderRadius: 60,
    opacity: 0.6,
  },
  avatarGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(139, 92, 246, 0.5)",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 2,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0f0f1a",
  },
  verifiedIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  playerName: {
    marginTop: 16,
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  verifiedTag: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  verifiedTagIcon: {
    color: "#10B981",
    fontWeight: "900",
  },
  verifiedTagText: {
    color: "#10B981",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
  },
  newPlayerTag: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  newPlayerTagText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
  },

  scoreDisplay: {
    marginTop: 20,
    alignItems: "center",
  },
  scoreValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 4,
  },

  quickStats: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  quickStat: {
    alignItems: "center",
  },
  quickStatValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  quickStatLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Stats Grid
  statsGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: (SCREEN_WIDTH - 32 - 10) / 2 - 1,
  },
  statCardInner: {
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
  statSubValue: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },

  // Sections
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  sectionCount: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
  },

  emptySection: {
    padding: 32,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    gap: 8,
  },
  emptySectionIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  emptySectionTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "800",
  },
  emptySectionText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "600",
  },

  // Games List
  gamesList: {
    gap: 10,
  },
  gameCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  gameCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gameStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gameStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: "#10B981",
  },
  statusOther: {
    backgroundColor: "#F59E0B",
  },
  gameStatus: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  gameDate: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
  },
  gameStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameStat: {
    flex: 1,
    alignItems: "center",
  },
  gameStatValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  gameStatLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  gameStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Routes List
  routesList: {
    gap: 10,
  },
  routeCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  routeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  routeIcon: {
    fontSize: 22,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  routeDate: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  routeViewBtn: {
    borderRadius: 10,
    overflow: "hidden",
  },
  routeViewBtnGradient: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  routeViewBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  routePreview: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  routePreviewText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  routeStatsRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  routeStat: {
    flex: 1,
    alignItems: "center",
  },
  routeStatValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  routeStatLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  routeStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Member since
  memberSince: {
    marginTop: 24,
    alignItems: "center",
  },
  memberSinceText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontWeight: "600",
  },

  // Path Viewer Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    padding: 16,
  },
  pathViewerModal: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  pathViewerContent: {
    padding: 20,
  },
  pathViewerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  pathViewerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  pathViewerSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  pathViewerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  pathViewerCloseText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  // Path Board
  pathBoardContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  pathBoard: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pathNode: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pathNodeSelected: {
    borderColor: "rgba(139, 92, 246, 0.8)",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  pathNodeIndex: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontWeight: "800",
  },
  pathNodeIndexSelected: {
    color: "rgba(255,255,255,0.9)",
  },
  pathNodeBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0f0f1a",
  },
  pathNodeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
  pathNodeHand: {
    position: "absolute",
    bottom: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0f0f1a",
  },
  handLeft: {
    backgroundColor: "#3B82F6",
  },
  handRight: {
    backgroundColor: "#F59E0B",
  },
  pathNodeHandText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },
  pathNodeCount: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pathNodeCountText: {
    color: "#A78BFA",
    fontSize: 9,
    fontWeight: "900",
  },

  // Path Sequence
  pathSequenceContainer: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  pathSequenceTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  pathSequenceScroll: {
    maxHeight: 50,
  },
  pathSequenceTrack: {
    flexDirection: "row",
    alignItems: "center",
  },
  pathSequenceStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  pathSequenceNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  pathSequenceNodeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  pathSequenceHand: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 2,
  },
  pathSequenceArrow: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    marginHorizontal: 6,
  },

  // Path Stats
  pathStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 16,
  },
  pathStatItem: {
    flex: 1,
    alignItems: "center",
  },
  pathStatValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  pathStatLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  pathStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
