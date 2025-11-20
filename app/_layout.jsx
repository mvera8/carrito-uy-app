// app/_layout.jsx
import { Stack } from "expo-router";
import useTheme, { ThemeProvider } from "../hooks/useTheme";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "../hooks/useCart";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CartProvider>
          <InnerLayout />
        </CartProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function InnerLayout() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar style={colors.statusBarStyle} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
