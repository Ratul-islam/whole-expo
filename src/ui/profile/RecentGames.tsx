import React from "react";
import { View, Text } from "react-native";
import { ui } from "./profile.styles";
import { ProfileSession } from "./profile.types";
import {GameCard} from "./GameCard";

export default function RecentGamesSection({ games }: { games: ProfileSession[] }) {
  return (
    <View style={ui.section}>
      <View style={ui.sectionHeader}>
        <View style={ui.sectionTitleRow}>
          <Text style={ui.sectionIcon}>🏆</Text>
          <Text style={ui.sectionTitle}>RECENT GAMES</Text>
        </View>
        <Text style={ui.sectionCount}>{games.length} total</Text>
      </View>

      {games.length === 0 ? (
        <View style={ui.emptySection}>
          <Text style={ui.emptySectionIcon}>🎮</Text>
          <Text style={ui.emptySectionTitle}>No games yet</Text>
          <Text style={ui.emptySectionText}>Games will appear here once played</Text>
        </View>
      ) : (
        <View style={ui.gamesList}>
          {games.slice(0, 5).map((game, index) => (
            <GameCard key={game._id} game={game} index={index} />
          ))}
        </View>
      )}
    </View>
  );
}
