import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export const useResponsiveScale = () => {
  const { width } = useWindowDimensions();
  return useMemo(() => {
    return (size: number) => Math.min((width / 375) * size, size * 1.3);
  }, [width]);
};