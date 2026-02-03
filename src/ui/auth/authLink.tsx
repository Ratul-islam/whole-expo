import { Pressable, Text } from "react-native";
import { authStyles as s } from "./authStyles";

export function AuthLink({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={s.link}>{text}</Text>
    </Pressable>
  );
}
