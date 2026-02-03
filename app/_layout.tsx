import { useEffect } from "react";
import { useAuthStore } from "../src/auth/auth.store";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useSegments, Stack } from "expo-router";

export default function RootLayout() {
  const { isBooting, isAuthed, bootstrap } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (isBooting) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthed && !inAuthGroup) router.replace("/(auth)/login");
    if (isAuthed && inAuthGroup) router.replace("/(app)");
  }, [isAuthed, isBooting, segments]);

  if (isBooting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
