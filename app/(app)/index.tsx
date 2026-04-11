import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/auth/auth.store";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const logout = useAuthStore((st) => st.logout);

  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 40 : 28;
  const contentMaxWidth = isTablet ? 520 : 360;
  const logoWidth = Math.min(width * 0.34, 120);
  const logoHeight = logoWidth * 1.15;

  const cardButtonHeight = isSmallPhone ? 52 : 56;
  const buttonFontSize = isSmallPhone ? 16 : 17;
  const descFontSize = isSmallPhone ? 13 : 14;

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            minHeight: height,
            paddingHorizontal: horizontalPadding,
            paddingTop: isTablet ? 36 : 18,
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/icon.png")}
              resizeMode="contain"
              style={{
                width: logoWidth,
                height: logoHeight,
              }}
            />
          </View>

          <View style={styles.sections}>
            <MenuBlock
              title="Connect and Play"
              description="Connect to a board by scanning a 2D bar code and you will be ready to play!"
              buttonHeight={cardButtonHeight}
              buttonFontSize={buttonFontSize}
              descFontSize={descFontSize}
              onPress={() => router.push("/(app)/device")}
            />

            <MenuBlock
              title="My Routes"
              description="Access, Create, Modify and Upload your routes"
              buttonHeight={cardButtonHeight}
              buttonFontSize={buttonFontSize}
              descFontSize={descFontSize}
              onPress={() => router.push("/my-routes")}
            />

            <MenuBlock
              title="Leaderboard"
              description="Check out different athletes routes and score. Download their routes and challenge their score!"
              buttonHeight={cardButtonHeight}
              buttonFontSize={buttonFontSize}
              descFontSize={descFontSize}
              onPress={() => router.push("/leaderBoeadTypes")}
            />
          </View>

          {/* Logout button */}
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type MenuBlockProps = {
  title: string;
  description: string;
  onPress: () => void;
  buttonHeight: number;
  buttonFontSize: number;
  descFontSize: number;
};

function MenuBlock({
  title,
  description,
  onPress,
  buttonHeight,
  buttonFontSize,
  descFontSize,
}: MenuBlockProps) {
  return (
    <View style={styles.block}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            height: buttonHeight,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
          {title}
        </Text>
      </Pressable>

      <Text style={[styles.description, { fontSize: descFontSize }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F3F3",
  },
  scrollContent: {
    alignItems: "center",
  },
  container: {
    width: "100%",
  },
  logoWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 44,
  },
  brand: {
    marginTop: -6,
    color: "#000000",
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  sections: {
    gap: 26,
  },
  block: {},
  button: {
    width: "100%",
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#5E5E5E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: {
    color: "#111111",
    fontWeight: "400",
  },
  description: {
    color: "#8A8A8A",
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 2,
  },

  logoutButton: {
    marginTop: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E53935",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },

  logoutText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "600",
  },
});