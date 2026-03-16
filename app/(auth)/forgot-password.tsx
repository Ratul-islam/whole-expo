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

import { useRouter } from "expo-router";
import { authService } from "../../src/auth/auth.service";
import { getErrorMessage } from "../../src/ui/auth/error";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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

  const clearMessages = () => {
    if (err) setErr(null);
    if (info) setInfo(null);
  };

  const onSendOtp = async () => {
    const cleanEmail = email.trim();

    setErr(null);
    setInfo(null);

    if (!cleanEmail) {
      setErr("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword({ email: cleanEmail });

      router.push({
        pathname: "/(auth)/verify-reset-otp",
        params: { email: cleanEmail },
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
              Forgot password
            </Text>

            <Text style={[styles.subtitle, { fontSize: ui.subtitleSize }]}>
              Enter your email to get an OTP
            </Text>

            <TextInput
              placeholder="email@domain.com"
              placeholderTextColor="#A5A5A5"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearMessages();
              }}
              style={[
                styles.input,
                {
                  height: ui.inputHeight,
                  marginBottom: ui.sectionGap,
                },
              ]}
            />

            {err ? <Text style={styles.error}>{err}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  height: ui.buttonHeight,
                  opacity: pressed || loading ? 0.88 : 1,
                },
              ]}
              onPress={onSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Send OTP</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to login</Text>
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
  },
  info: {
    color: "#0F8A5F",
    fontSize: 14,
    marginTop: -4,
    marginBottom: 12,
    textAlign: "center",
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