import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ScreenLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 24 : isSmallPhone ? 14 : 16;
  const contentMaxWidth = isTablet ? 720 : 520;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.outer}>
        <View
          style={[
            styles.body,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: isTablet ? 12 : 8,
              maxWidth: contentMaxWidth,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  outer: {
    flex: 1,
    alignItems: "center",
  },
  body: {
    flex: 1,
    width: "100%",
  },
});