import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function FloatingParticles({ count = 12 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      anim: new Animated.Value(0),
      x: Math.random() * SCREEN_WIDTH,
      size: 3 + Math.random() * 6,
      duration: 3000 + Math.random() * 3000,
      delay: i * 150,
      alpha: 0.18 + (i % 4) * 0.08,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const animate = () => {
        p.anim.setValue(0);
        Animated.timing(p.anim, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => animate());
      };
      animate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            s.p,
            {
              left: p.x,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: `rgba(139, 92, 246, ${p.alpha})`,
              transform: [
                {
                  translateY: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [700, -50],
                  }),
                },
              ],
              opacity: p.anim.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 0.6, 0.6, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  p: { position: "absolute" },
});
