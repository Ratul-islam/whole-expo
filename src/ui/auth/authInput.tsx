import { TextInput, TextInputProps } from "react-native";
import { authStyles as s } from "./authStyles";

export function AuthInput(props: TextInputProps) {
  return <TextInput {...props} style={[s.input, props.style]} />;
}
