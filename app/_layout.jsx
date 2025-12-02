// app/_layout.jsx
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "../hooks/useCart";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { AppIcon } from "../components";
import useTheme, { ThemeProvider } from "../hooks/useTheme";

export default function RootLayout() {
  const [loaded] = useFonts({
    ...Ionicons.font,
  });

  if (!loaded) return null;

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
				<Stack.Screen
					name="terms"
					options={{
						presentation: 'modal',
						title: "Terms Header",
						headerShown: true,
						headerLeft: () => null, // Opcional: elimina el botón de back
						headerRight: () => (
							<Pressable onPress={() => router.back()}>
								<AppIcon icon="close" variant="transparent" />
							</Pressable>
						),
					}}
				/>
				
      </Stack>
    </>
  );
}
