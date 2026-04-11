import { useEffect } from "react";
import {  BackHandler } from "react-native";
import { useRouter, Stack } from "expo-router";

export default function RootLayout() {
  const router = useRouter();
  
  useEffect(()=>{
    const onBackPress=()=>{
      if(!router.canGoBack()){
        BackHandler.exitApp();
        return true
      }
      return false
    }

    const sub = BackHandler.addEventListener('hardwareBackPress' ,onBackPress )

    return ()=>sub.remove()
  })
  

  return <Stack screenOptions={{ headerShown: false }} />;
}
