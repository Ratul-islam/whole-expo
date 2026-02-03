import { useMemo, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authService } from "../../src/auth/auth.service";
import { AuthLayout } from "../../src/ui/auth/authLayout";
import { AuthInput } from "../../src/ui/auth/authInput";
import { AuthButton } from "../../src/ui/auth/authButton";
import { authStyles as s } from "../../src/ui/auth/authStyles";
import { getErrorMessage } from "../../src/ui/auth/error";

export default function VerifyResetOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const email = useMemo(
    () => (params.email ? String(params.email) : ""),
    [params.email]
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onVerify = async () => {
    setErr(null);
    setLoading(true);

    try {
      const res = await authService.resetPasswordVerifyOtp({
        email,
        code: otp,
      });
      
      const resetToken = res.data?.resetToken;
      if (!resetToken) {
        throw new Error("Reset token missing");
      }

      router.replace({
        pathname: "/(auth)/set-new-pasword",
        params: {resetToken} ,
      });
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`Enter the code sent to ${email}`}
    >
      <AuthInput
        placeholder="OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      {err ? <Text style={s.error}>{err}</Text> : null}

      <AuthButton
        title="Verify"
        loading={loading}
        onPress={onVerify}
        disabled={loading}
      />
    </AuthLayout>
  );
}
