import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "../../src/auth/auth.store";
import { AuthLayout } from "../../src/ui/auth/authLayout";
import { AuthInput } from "../../src/ui/auth/authInput";
import { AuthButton } from "../../src/ui/auth/authButton";
import { AuthLink } from "../../src/ui/auth/authLink";
import { authStyles as s } from "../../src/ui/auth/authStyles";
import { getErrorMessage } from "../../src/ui/auth/error";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ verified?: string }>();

  const login = useAuthStore((st) => st.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (params.verified === "true") {
      setInfo("✅ Email verified successfully. Please log in again.");
    }
  }, [params.verified]);

  const onLogin = async () => {
    setErr(null);
    setInfo(null);

    const cleanEmail = email.trim();

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

  return (
    <AuthLayout title="Login" subtitle="Sign in to continue">
      <AuthInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AuthInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {info ? <Text style={s.info}>{info}</Text> : null}
      {err ? <Text style={s.error}>{err}</Text> : null}

      <AuthButton
        title="Sign in"
        loading={loading}
        onPress={onLogin}
        disabled={loading}
      />

      <AuthLink
        text="Forgot password?"
        onPress={() => router.push("/(auth)/forgot-password")}
      />
      <AuthLink
        text="Create a new account"
        onPress={() => router.push("/(auth)/register")}
      />
    </AuthLayout>
  );
}
