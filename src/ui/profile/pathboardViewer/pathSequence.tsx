import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type HandBit = 0 | 1;
export type PathStep = [number, HandBit];

export function PathSequence({ path }: { path: PathStep[] }) {
  return (
    <View style={s.seqBox}>
      <Text style={s.seqTitle}>PATH</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52 }}>
        <View style={s.seqTrack}>
          {(path || []).map((step, i) => (
            <View key={i} style={s.seqStep}>
              <View style={s.seqNode}>
                <Text style={s.seqNodeText}>{step[0] + 1}</Text>
              </View>
              <Text style={s.seqHand}>{step[1] === 0 ? "L" : "R"}</Text>
              {i < path.length - 1 ? <Text style={s.seqArrow}>→</Text> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  seqBox: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },
  seqTitle: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  seqTrack: {
    flexDirection: "row",
    alignItems: "center",
  },
  seqStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  seqNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  seqNodeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  seqHand: {
    color: "#6B6B6B",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 3,
  },
  seqArrow: {
    color: "#999999",
    fontSize: 12,
    marginHorizontal: 6,
  },
});