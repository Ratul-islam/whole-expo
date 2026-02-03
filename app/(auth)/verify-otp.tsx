import { useMemo, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authService } from "../../src/auth/auth.service";
import { useAuthStore } from "../../src/auth/auth.store";
import { AuthLayout } from "../../src/ui/auth/authLayout";
import { AuthInput } from "../../src/ui/auth/authInput";
import { AuthButton } from "../../src/ui/auth/authButton";
import { AuthLink } from "../../src/ui/auth/authLink";
import { authStyles as s } from "../../src/ui/auth/authStyles";
import { getErrorMessage } from "../../src/ui/auth/error";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const bootstrap = useAuthStore((st) => st.bootstrap);

  const params = useLocalSearchParams<{ email?: string; otpSessionId?: string }>();

  const email = useMemo(() => (params.email ? String(params.email) : ""), [params.email]);

  const otpSessionId = useMemo(
    () => (params.otpSessionId ? String(params.otpSessionId) : ""),
    [params.otpSessionId]
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onVerify = async () => {
    setErr(null);
    setInfo(null);

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
      const payload: any = { email: email.trim(), code: otp.trim() };
      if (otpSessionId) payload.otpSessionId = otpSessionId;

      await authService.verifyEmailOtp(payload);

      await bootstrap();
      router.replace({
        pathname:"/(auth)/login",
        params: { verified:"true"}
      });
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setErr(null);
    setInfo(null);

    if (!email.trim()) {
      setErr("Email is missing. Please go back and try again.");
      return;
    }

    setResending(true);
    try {
      await authService.resendEmailOtp({ email: email.trim(), type: "EMAIL_VERIFICATION" });
      setInfo("OTP sent again.");
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`We sent a code to: ${email || "your email"}`}>
      <AuthInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      {err ? <Text style={s.error}>{err}</Text> : null}
      {info ? <Text style={s.info}>{info}</Text> : null}

      <AuthButton title="Verify" loading={loading} onPress={onVerify} disabled={loading} />
      <AuthButton
        title="Resend OTP"
        loading={resending}
        onPress={onResend}
        disabled={resending}
      />

      <AuthLink text="Change email" onPress={() => router.replace("/(auth)/register")} />
    </AuthLayout>
  );
}
