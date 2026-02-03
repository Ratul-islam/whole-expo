import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, ScrollView } from "react-native";
import { Hand, RouteDifficulty, RouteMove, RouteProgram, Route } from "../../routes/types";

const difficulties: RouteDifficulty[] = ["EASY", "MEDIUM", "HARD", "PRO"];
const hands: Hand[] = ["LEFT", "RIGHT"];

function ButtonChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[s.chip, active ? s.chipActive : null]} onPress={onPress}>
      <Text style={[s.chipText, active ? s.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export function RouteForm({
  mode,
  initial,
  currentUserName,
  onSave,
}: {
  mode: "create" | "edit";
  initial?: Route;
  currentUserName: string;
  onSave: (route: Route) => void;
}) {
  const [fileName, setFileName] = useState(initial?.fileName ?? "");
  const [difficulty, setDifficulty] = useState<RouteDifficulty>(initial?.difficulty ?? "EASY");

  // One simple program editor (you can expand to multiple programs later)
  const [moves, setMoves] = useState<RouteMove[]>(
    initial?.programs?.[0]?.moves?.length
      ? initial.programs[0].moves
      : [{ moveNumber: 1, holePosition: "", hand: "RIGHT" }]
  );

  const numberOfMoves = useMemo(() => moves.filter((m) => m.holePosition.trim()).length, [moves]);

  const addMove = () => {
    setMoves((prev) => [
      ...prev,
      { moveNumber: prev.length + 1, holePosition: "", hand: "RIGHT" },
    ]);
  };

  const updateMove = (idx: number, patch: Partial<RouteMove>) => {
    setMoves((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...patch, moveNumber: i + 1 } : m))
    );
  };

  const removeMove = (idx: number) => {
    setMoves((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((m, i) => ({ ...m, moveNumber: i + 1 }));
    });
  };

  const canSave = fileName.trim().length > 0 && numberOfMoves > 0;

  const handleSave = () => {
    if (!canSave) return;

    const program: RouteProgram = {
      name: "Main",
      moves: moves
        .map((m, i) => ({ ...m, moveNumber: i + 1 }))
        .filter((m) => m.holePosition.trim().length > 0),
    };

    const now = new Date().toISOString();

    const route: Route = {
      id: initial?.id ?? `local_${Date.now()}`,
      fileName: fileName.trim(),
      difficulty,
      createdBy: initial?.createdBy ?? currentUserName, // auto
      createdAtISO: initial?.createdAtISO ?? now, // auto on create
      numberOfMoves: program.moves.length,
      programs: [program],
      isCreatedByMe: true,
      isDownloaded: true,
      bestScore: initial?.bestScore ?? null,
      bestTimeMs: initial?.bestTimeMs ?? null,
    };

    onSave(route);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={s.label}>File name</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Sprint Drill 01"
        placeholderTextColor="rgba(255,255,255,0.35)"
        value={fileName}
        onChangeText={setFileName}
      />

      <Text style={s.label}>Difficulty</Text>
      <View style={s.chipRow}>
        {difficulties.map((d) => (
          <ButtonChip key={d} label={d} active={difficulty === d} onPress={() => setDifficulty(d)} />
        ))}
      </View>

      <View style={s.autoRow}>
        <Text style={s.autoText}>Route creator: {initial?.createdBy ?? currentUserName}</Text>
        <Text style={s.autoText}>
          Date/Time: {new Date(initial?.createdAtISO ?? Date.now()).toLocaleString()}
        </Text>
      </View>

      <Text style={[s.label, { marginTop: 14 }]}>Route program</Text>
      <Text style={s.smallHint}>Add moves (move # auto, you enter hole + hand).</Text>

      {moves.map((m, idx) => (
        <View key={idx} style={s.moveCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.moveTitle}>Move #{idx + 1}</Text>
            {moves.length > 1 ? (
              <Pressable onPress={() => removeMove(idx)}>
                <Text style={s.remove}>Remove</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={s.labelMini}>Hole position</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. A1"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={m.holePosition}
            onChangeText={(v) => updateMove(idx, { holePosition: v })}
          />

          <Text style={s.labelMini}>Right / Left hand</Text>
          <View style={s.chipRow}>
            {hands.map((h) => (
              <ButtonChip
                key={h}
                label={h}
                active={m.hand === h}
                onPress={() => updateMove(idx, { hand: h })}
              />
            ))}
          </View>
        </View>
      ))}

      <Pressable style={s.secondaryBtn} onPress={addMove}>
        <Text style={s.secondaryText}>+ Add move</Text>
      </Pressable>

      <Pressable
        style={[s.primaryBtn, !canSave ? { opacity: 0.45 } : null]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text style={s.primaryText}>{mode === "create" ? "Save route" : "Save changes"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  label: { color: "rgba(255,255,255,0.85)", fontWeight: "800", marginTop: 10, marginBottom: 6 },
  labelMini: { color: "rgba(255,255,255,0.75)", fontWeight: "800", marginTop: 10, marginBottom: 6, fontSize: 12 },
  smallHint: { color: "rgba(255,255,255,0.6)", marginBottom: 10, fontSize: 12, lineHeight: 16 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "white",
  },
  chipRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  chipActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  chipText: { color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: 12 },
  chipTextActive: { color: "white" },
  autoRow: {
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    gap: 4,
  },
  autoText: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "600" },
  moveCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  moveTitle: { color: "white", fontWeight: "900" },
  remove: { color: "rgba(255,120,120,0.9)", fontWeight: "900" },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  secondaryText: { color: "white", fontWeight: "900" },
  primaryBtn: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(80,160,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(80,160,255,0.55)",
  },
  primaryText: { color: "white", fontWeight: "900" },
});
