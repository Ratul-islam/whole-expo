import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function ViewerStats({
  steps,
  unique,
  leftCount,
  rightCount,
}: {
  steps: number;
  unique: number;
  leftCount: number;
  rightCount: number;
}) {
  return (
    <View style={s.statsRow}>
      <Stat label="Steps" value={steps} />
      <Div />
      <Stat label="Unique" value={unique} />
      <Div />
      <Stat label="Hands" value={`${leftCount}L / ${rightCount}R`} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={s.stat}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

function Div() {
  return <View style={s.statDiv} />;
}

const s = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    padding: 14,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },
  statLbl: {
    color: "#6B6B6B",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  statDiv: {
    width: 1,
    height: 34,
    backgroundColor: "#D9D9D9",
  },
});