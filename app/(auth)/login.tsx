import { useEffect, useMemo, useState } from "react";
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
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authService } from "../../src/auth/auth.service";
import { useAuthStore } from "../../src/auth/auth.store";
import { getErrorMessage } from "../../src/ui/auth/error";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthMode = "email" | "login" | "register";

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ verified?: string; email?: string }>();
  const { width, height } = useWindowDimensions();

  const login = useAuthStore((st) => st.login);

  const [mode, setMode] = useState<AuthMode>("email");

  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (params.verified === "true") {
      setInfo("Email verified successfully. Please log in again.");
      setMode("login");
    }
  }, [params.verified]);

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
      socialHeight: isSmallPhone ? 50 : 54,
      topSpacing: height < 700 ? 20 : isTabletLike ? 48 : 32,
      logoBottom: height < 700 ? 28 : 40,
      sectionGap: isSmallPhone ? 12 : 14,
    };
  }, [width, height]);

  const resetMessages = () => {
    if (err) setErr(null);
    if (info) setInfo(null);
  };


  useEffect(() => {
  if (params.email) {
    setEmail(String(params.email));
  }
}, [params.email]);
  const onCheckEmail = async () => {
    const cleanEmail = email.trim();

    setErr(null);
    setInfo(null);

    if (!cleanEmail) {
      setErr("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await authService.exists({ email: cleanEmail });
      setMode("login");
      setPassword("");
    } catch (e: any) {
      const status =
        e?.response?.status ?? e?.status ?? e?.data?.statusCode ?? e?.statusCode;

      if (status === 404) {
        setMode("register");
        setFirst("");
        setLast("");
        setPassword("");
        return;
      }

      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    const cleanEmail = email.trim();

    setErr(null);
    setInfo(null);

    if (!cleanEmail) {
      setErr("Please enter your email.");
      return;
    }

    if (!password) {
      setErr("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password);
      router.replace("/(app)");
    } catch (e: any) {
      const status =
        e?.response?.status ?? e?.status ?? e?.data?.statusCode ?? e?.statusCode;

      if (status === 408) {
        const otpSessionId =
          e?.response?.data?.otpSessionId ??
          e?.data?.otpSessionId ??
          e?.otpSessionId;

        router.replace({
          pathname: "/(auth)/verify-otp",
          params: {
            email: cleanEmail,
            ...(otpSessionId ? { otpSessionId: String(otpSessionId) } : {}),
          },
        });
        return;
      }

      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async () => {
    const cleanEmail = email.trim();

    setErr(null);
    setInfo(null);

    if (!first.trim()) {
      setErr("Please enter your first name.");
      return;
    }

    if (!last.trim()) {
      setErr("Please enter your last name.");
      return;
    }

    if (!cleanEmail) {
      setErr("Please enter your email.");
      return;
    }

    if (!password) {
      setErr("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        firstName: first.trim(),
        lastName: last.trim(),
        email: cleanEmail,
        password,
      });

      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: cleanEmail },
      });
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onPrimaryPress = async () => {
    if (mode === "email") {
      await onCheckEmail();
      return;
    }

    if (mode === "login") {
      await onLogin();
      return;
    }

    await onRegister();
  };

  const onGoogle = async () => {
    try {
      setErr(null);
      setInfo(null);
      setGoogleLoading(true);
      // await authService.signInWithGoogle();
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setGoogleLoading(false);
    }
  };

  const onApple = async () => {
    try {
      setErr(null);
      setInfo(null);
      setAppleLoading(true);
      // await authService.signInWithApple();
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setAppleLoading(false);
    }
  };

  const useDifferentEmail = () => {
    setMode("email");
    setFirst("");
    setLast("");
    setPassword("");
    setErr(null);
    setInfo(null);
  };

  const title =
    mode === "login"
      ? "Welcome back"
      : mode === "register"
      ? "Create an account"
      : "Create an account";

  const subtitle =
    mode === "login"
      ? "Enter your password to continue"
      : mode === "register"
      ? "Complete your details to sign up"
      : "Enter your email to sign up for this app";

  const buttonTitle =
    mode === "login" ? "Login" : mode === "register" ? "Register" : "Continue";

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
              {title}
            </Text>

            <Text style={[styles.subtitle, { fontSize: ui.subtitleSize }]}>
              {subtitle}
            </Text>

            {mode === "register" ? (
              <>
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="#A5A5A5"
                  value={first}
                  onChangeText={(text) => {
                    setFirst(text);
                    resetMessages();
                  }}
                  style={[
                    styles.input,
                    {
                      height: ui.inputHeight,
                      marginBottom: ui.sectionGap,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="#A5A5A5"
                  value={last}
                  onChangeText={(text) => {
                    setLast(text);
                    resetMessages();
                  }}
                  style={[
                    styles.input,
                    {
                      height: ui.inputHeight,
                      marginBottom: ui.sectionGap,
                    },
                  ]}
                />
              </>
            ) : null}

            <TextInput
              placeholder="email@domain.com"
              placeholderTextColor="#A5A5A5"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={mode === "email"}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                resetMessages();
              }}
              style={[
                styles.input,
                mode !== "email" && styles.inputDisabled,
                {
                  height: ui.inputHeight,
                  marginBottom: ui.sectionGap,
                },
              ]}
            />

            {(mode === "login" || mode === "register") && (
              <TextInput
                placeholder="Password"
                placeholderTextColor="#A5A5A5"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  resetMessages();
                }}
                style={[
                  styles.input,
                  {
                    height: ui.inputHeight,
                    marginBottom: ui.sectionGap,
                  },
                ]}
              />
            )}

            {info ? <Text style={styles.info}>{info}</Text> : null}
            {err ? <Text style={styles.error}>{err}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  height: ui.buttonHeight,
                  opacity: pressed || loading ? 0.88 : 1,
                },
              ]}
              onPress={onPrimaryPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{buttonTitle}</Text>
              )}
            </Pressable>

            {mode !== "email" ? (
              <>
              <Pressable onPress={useDifferentEmail} style={styles.backButton}>
                <Text style={styles.backButtonText}>Use a different email</Text>
              </Pressable>
              <Pressable onPress={()=>{

                router.push({
                  pathname: "/(auth)/forgot-password"
                });
              }} style={styles.backButton}>
                <Text style={styles.backButtonText}>Forgot password?</Text>
              </Pressable>
              </>
            ) : (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                {/* <Pressable
                  style={({ pressed }) => [
                    styles.socialButton,
                    {
                      height: ui.socialHeight,
                      opacity: pressed || googleLoading ? 0.9 : 1,
                    },
                  ]}
                  onPress={onGoogle}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator color="#111111" />
                  ) : (
                    <>
                      <View style={styles.iconWrap}>
                        <AntDesign name="google" size={20} color="#111111" />
                      </View>
                      <Text style={styles.socialText}>Continue with Google</Text>
                    </>
                  )}
                </Pressable> */}

                {/* <Pressable
                  style={({ pressed }) => [
                    styles.socialButton,
                    {
                      height: ui.socialHeight,
                      opacity: pressed || appleLoading ? 0.9 : 1,
                    },
                  ]}
                  onPress={onApple}
                  disabled={appleLoading}
                >
                  {appleLoading ? (
                    <ActivityIndicator color="#111111" />
                  ) : (
                    <>
                      <View style={styles.iconWrap}>
                        <AntDesign name="apple" size={20} color="#111111" />
                      </View>
                      <Text style={styles.socialText}>Continue with Apple</Text>
                    </>
                  )}
                </Pressable> */}
              </>
            )}

            <Text style={styles.footerText}>
              By clicking continue, you agree to our{" "}
              <Text style={styles.link}>Terms of Service</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
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
  inputDisabled: {
    opacity: 0.7,
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
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: "#444444",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#CFCFCF",
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 16,
    color: "#7A7A7A",
  },
  socialButton: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#EDEDED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  iconWrap: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#111111",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#8A8A8A",
    lineHeight: 22,
    marginTop: 18,
    paddingHorizontal: 10,
  },
  link: {
    color: "#222222",
  },
});