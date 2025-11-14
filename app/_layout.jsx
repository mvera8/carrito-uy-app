import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";

// options={{ headerShown: false }}
export default function RootLayout() {
  return (
		 <CartProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      </Stack>
		</CartProvider>
  );
}
