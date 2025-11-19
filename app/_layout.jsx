// app/_layout.jsx
import { Stack } from "expo-router";
import { ThemeProvider } from "../hooks/useTheme";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "../hooks/useCart";

export default function RootLayout() {
  return (
    <CartProvider>
      <ThemeProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
          <Stack.Screen name="product" options={{ headerShown: true }} />
        </Stack>
      </ThemeProvider>
    </CartProvider>
  );
}