import { useMemo, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authService } from "../../src/auth/auth.service";
import { AuthLayout } from "../../src/ui/auth/authLayout";
import { AuthInput } from "../../src/ui/auth/authInput";
import { AuthButton } from "../../src/ui/auth/authButton";
import { authStyles as s } from "../../src/ui/auth/authStyles";
import { getErrorMessage } from "../../src/ui/auth/error";

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ resetToken?: string }>();

  const resetToken = useMemo(
    () => (params.resetToken ? String(params.resetToken) : ""),
    [params.resetToken]
  );

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      await authService.resetPasswordConfirm({
        resetToken,
        password,
      });

      setInfo("Password reset successful. Please login.");
      router.replace("/(auth)/login");
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set new password">
      <AuthInput
        placeholder="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {err ? <Text style={s.error}>{err}</Text> : null}
      {info ? <Text style={s.info}>{info}</Text> : null}

      <AuthButton
        title="Update password"
        loading={loading}
        onPress={onSubmit}
        disabled={loading}
      />
    </AuthLayout>
  );
}
