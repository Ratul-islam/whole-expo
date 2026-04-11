import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>LEADERBOARD</Text>

      <View style={styles.grid}>
        <View style={styles.row}>
            <Pressable onPress={()=>{
                router.push("/(app)/leaderBoard?boardConf=20")
            }} style={styles.box}>

            <Text style={styles.text}>NextPeg</Text>
            </Pressable>

          <TouchableOpacity style={styles.box}>
            <Text style={styles.text}>NextRung</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>

            <Pressable onPress={()=>{
                router.push("/(app)/leaderBoard?boardConf=10")
            }} style={styles.box}>

            <Text style={styles.text}>NextPeg Lite</Text>
            </Pressable>

          <TouchableOpacity style={styles.box}>
            <Text style={styles.text}>NextRung Lite</Text>
          </TouchableOpacity>
        </View>
      </View>



        <View style={styles.bottomBox}>
            <Pressable onPress={()=>{
                router.push("/(app)/gamesLeaderboard")
            }} >

            <Text style={styles.text}>Athelete</Text>
            </Pressable>

        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9e9e9",
    alignItems: "center",
    paddingTop: 30,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 40,
  },

  grid: {
    width: "85%",
    gap: 25,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  box: {
    width: "45%",
    height: 140,
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#555",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  bottomBox: {
    width: "45%",
    height: 140,
    marginTop: 30,
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#555",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});