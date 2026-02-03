import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../src/auth/auth.service";
import { AuthLayout } from "../../src/ui/auth/authLayout";
import { AuthInput } from "../../src/ui/auth/authInput";
import { AuthButton } from "../../src/ui/auth/authButton";
import { AuthLink } from "../../src/ui/auth/authLink";
import { authStyles as s } from "../../src/ui/auth/authStyles";
import { getErrorMessage } from "../../src/ui/auth/error";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSendOtp = async () => {
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });

      setInfo("OTP sent. Check your email.");
      router.push({
        pathname: "/(auth)/verify-reset-otp",
        params: { email },
      });
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email to get an OTP">
      <AuthInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {err ? <Text style={s.error}>{err}</Text> : null}
      {info ? <Text style={s.info}>{info}</Text> : null}

      <AuthButton title="Send OTP" loading={loading} onPress={onSendOtp} disabled={loading} />
      <AuthLink text="Back to login" onPress={() => router.replace("/(auth)/login")} />
    </AuthLayout>
  );
}
