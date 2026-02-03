import { Pressable, Text, ActivityIndicator, PressableProps } from "react-native";
import { authStyles as s } from "./authStyles";

export function AuthButton({
  title,
  loading,
  ...props
}: PressableProps & { title: string; loading?: boolean }) {
  return (
    <Pressable style={[s.btn, props.disabled ? { opacity: 0.6 } : null]} {...props}>
      {loading ? <ActivityIndicator /> : <Text style={s.btnText}>{title}</Text>}
    </Pressable>
  );
}
