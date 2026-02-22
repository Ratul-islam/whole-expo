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

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onRegister = async () => {
    setErr(null);
    setLoading(true);
    try {
      await authService.register({ firstName:first, lastName:last,email, password });

      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email},
      });
    } catch (e: any) {
      
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Register" subtitle="Create your account">
      <AuthInput
        placeholder="First Name"
        value={first}
        onChangeText={setFirst}
      />
      <AuthInput
        placeholder="Last Name"
        value={last}
        onChangeText={setLast}
      />
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

      {err ? <Text style={s.error}>{err}</Text> : null}

      <AuthButton title="Register" loading={loading} onPress={onRegister} disabled={loading} />

      <AuthLink text="Already have an account? Login" onPress={() => router.replace("/(auth)/login")} />
    </AuthLayout>
  );
}
