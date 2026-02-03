import React from "react";
import { View, Text } from "react-native";
import { ui } from "./profile.styles";
import { ProfilePath } from "./profile.types";
import { RouteCard } from "./RouteCard";

export default function RoutesSection({
  paths,
  onOpen,
}: {
  paths: ProfilePath[];
  onOpen: (path: ProfilePath) => void;
}) {
  return (
    <View style={ui.section}>
      <View style={ui.sectionHeader}>
        <View style={ui.sectionTitleRow}>
          <Text style={ui.sectionIcon}>🗺️</Text>
          <Text style={ui.sectionTitle}>CREATED ROUTES</Text>
        </View>
        <Text style={ui.sectionCount}>{paths.length} total</Text>
      </View>

      {paths.length === 0 ? (
        <View style={ui.emptySection}>
          <Text style={ui.emptySectionIcon}>🗺️</Text>
          <Text style={ui.emptySectionTitle}>No routes created</Text>
          <Text style={ui.emptySectionText}>This player hasn&apos;t created any routes yet</Text>
        </View>
      ) : (
        <View style={ui.routesList}>
          {paths.slice(0, 5).map((route, index) => (
            <RouteCard key={route._id} route={route} index={index} onPress={() => onOpen(route)} />
          ))}
        </View>
      )}
    </View>
  );
}
