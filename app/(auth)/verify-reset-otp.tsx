import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";


import { useLocalSearchParams, useRouter } from "expo-router";
import { authService } from "../../src/auth/auth.service";
import { getErrorMessage } from "../../src/ui/auth/error";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyResetOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { width, height } = useWindowDimensions();

  const email = useMemo(
    () => (params.email ? String(params.email) : ""),
    [params.email]
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ui = useMemo(() => {
    const isSmallPhone = width < 360;
    const isTabletLike = width >= 768;

    const horizontalPadding = isTabletLike ? 40 : width < 390 ? 20 : 24;
    const cardMaxWidth = isTabletLike ? 520 : 460;
    const logoWidth = Math.min(width * 0.62, 280);
    const logoHeight = logoWidth * 0.52;

    return {
      horizontalPadding,
      cardMaxWidth,
      logoWidth,
      logoHeight,
      titleSize: isTabletLike ? 30 : isSmallPhone ? 28 : 30,
      subtitleSize: isTabletLike ? 17 : 16,
      inputHeight: isSmallPhone ? 50 : 54,
      buttonHeight: isSmallPhone ? 50 : 54,
      topSpacing: height < 700 ? 20 : isTabletLike ? 48 : 32,
      logoBottom: height < 700 ? 28 : 40,
      sectionGap: isSmallPhone ? 12 : 14,
    };
  }, [width, height]);

  const onVerify = async () => {
    setErr(null);

    if (!email.trim()) {
      setErr("Email is missing. Please go back and try again.");
      return;
    }

    if (otp.trim().length !== 6) {
      setErr("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPasswordVerifyOtp({
        email: email.trim(),
        code: otp.trim(),
      });

      const resetToken = res.data?.resetToken;
      if (!resetToken) {
        throw new Error("Reset token missing");
      }

      router.replace({
        pathname: "/(auth)/set-new-pasword",
        params: { resetToken: String(resetToken) },
      });
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: ui.horizontalPadding,
              paddingTop: ui.topSpacing,
              paddingBottom: 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.inner, { maxWidth: ui.cardMaxWidth }]}>
            <View style={[styles.logoWrap, { marginBottom: ui.logoBottom }]}>
              <Image
                source={require("../../assets/images/icon.png")}
                resizeMode="contain"
                style={{
                  width: ui.logoWidth,
                  height: ui.logoHeight,
                }}
              />
            </View>

            <Text style={[styles.title, { fontSize: ui.titleSize }]}>
              Verify OTP
            </Text>

            <Text style={[styles.subtitle, { fontSize: ui.subtitleSize }]}>
              Enter the code sent to {email || "your email"}
            </Text>

            <TextInput
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#A5A5A5"
              keyboardType="number-pad"
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ""));
                if (err) setErr(null);
              }}
              maxLength={6}
              style={[
                styles.input,
                {
                  height: ui.inputHeight,
                  marginBottom: ui.sectionGap,
                },
              ]}
            />

            {err ? <Text style={styles.error}>{err}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  height: ui.buttonHeight,
                  opacity: pressed || loading ? 0.88 : 1,
                },
              ]}
              onPress={onVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Go back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  inner: {
    width: "100%",
    alignSelf: "center",
  },
  logoWrap: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    textAlign: "center",
    color: "#2B2B2B",
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111111",
    textAlign: "center",
    letterSpacing: 6,
  },
  error: {
    color: "#D93025",
    fontSize: 14,
    marginTop: -4,
    marginBottom: 12,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    alignSelf: "center",
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: "#444444",
  },
});