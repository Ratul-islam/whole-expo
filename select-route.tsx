import React, { useEffect, useMemo, useState } from "react";
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenLayout } from "@/src/ui/app/screenLayout";
import { pathService } from "@/src/path/path.services";
import { sessionService } from "@/src/session/session.services";
import { deviceService } from "@/src/device/device.services";

type HandBit = 0 | 1;
type PathStep = [number, HandBit];

type PathDTO = {
  _id: string;
  userId: string;
  name: string;
  path: PathStep[];
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  status: "success" | "error";
  message: string;
  data: PathDTO[];
};

export default function SelectRouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ deviceId?: string; deviceSecret?: string }>();

  const deviceId = String(params.deviceId ?? "");
  const deviceSecret = String(params.deviceSecret ?? "");

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<PathDTO[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) {
      Alert.alert("Missing device", "No deviceId was provided from QR scan.");
      router.back();
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = (await pathService.getAllPath()) as ApiResponse;
        if (!res || res.status !== "success" || !Array.isArray(res.data)) {
          throw new Error(res?.message || "Failed to load routes");
        }
        setRoutes(res.data.map((r) => ({ ...r, path: Array.isArray(r.path) ? r.path : [] })));
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load routes.");
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [deviceId]);

  const sorted = useMemo(() => {
    return [...routes].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  }, [routes]);

  const onSelect = async (r: PathDTO) => {
    try {
      setSubmittingId(r._id);

      const res = await deviceService.loadPreset({
        deviceId,
        deviceSecret,
        pathId: r._id,
      })
      if (!res) {
        Alert.alert(
          "TODO API",
          JSON.stringify({ deviceId, deviceSecret, pathId: r._id, preset: { name: r.name, path: r.path } }, null, 2)
        );
        return;
      }

      Alert.alert("Started", `Device: ${deviceId}\nRoute: ${r.name}`);
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "Could not start session.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <ScreenLayout title="Select a route" subtitle={`Device: ${deviceId}`}>
      <View style={s.metaRow}>
        <Text style={s.meta}>deviceSecret: {deviceSecret ? "✅ present" : "⚠️ missing"}</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator />
          <Text style={s.dim}>Loading your routes…</Text>
        </View>
      ) : sorted.length === 0 ? (
        <View style={s.center}>
          <Text style={s.dim}>No routes found. Create one first.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {sorted.map((r) => {
            const busy = submittingId === r._id;
            return (
              <Pressable
                key={r._id}
                onPress={() => onSelect(r)}
                disabled={!!submittingId}
                style={[s.card, busy && s.cardBusy]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{r.name}</Text>
                  <Text style={s.cardSub}>{r.path.length} steps</Text>
                </View>

                <View style={s.pickBtn}>
                  <Text style={s.pickText}>{busy ? "Starting…" : "Select"}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const s = StyleSheet.create({
  metaRow: { marginBottom: 10 },
  meta: { color: "rgba(255,255,255,0.75)", fontWeight: "700" },

  center: { marginTop: 30, alignItems: "center", gap: 10 },
  dim: { color: "rgba(255,255,255,0.7)", fontWeight: "700" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardBusy: { opacity: 0.7 },

  cardTitle: { color: "white", fontWeight: "900", fontSize: 16 },
  cardSub: { color: "rgba(255,255,255,0.65)", marginTop: 4, fontWeight: "700" },

  pickBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "white",
  },
  pickText: { color: "black", fontWeight: "900" },
});
