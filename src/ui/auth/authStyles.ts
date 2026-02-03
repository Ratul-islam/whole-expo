import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  // Page
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#0B0F1A", // dark bg
  },

  // Text
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8, color: "#FFFFFF" },
  subtitle: { opacity: 0.75, marginBottom: 14, color: "#FFFFFF" },

  // Inputs
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
    color: "#FFFFFF",
  },

  // Buttons
  btn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 6,
    backgroundColor: "rgba(80,160,255,0.22)", // primary feel
    borderColor: "rgba(80,160,255,0.55)",
  },
  btnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },

  // Messages (same theme)
  error: {
    marginTop: 8,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,80,80,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.35)",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  info: {
    marginTop: 8,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(80,160,255,0.14)", // success/info panel
    borderWidth: 1,
    borderColor: "rgba(80,160,255,0.35)",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Links
  link: { marginTop: 14, textAlign: "center", opacity: 0.8, color: "#FFFFFF" },
});
