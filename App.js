import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CartProvider, useCart } from "./context/CartContext";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";

const Stack = createNativeStackNavigator();

// Componente wrapper para usar el carrito en los headers
function AppNavigator() {
  const { cart } = useCart();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <>
            <TouchableOpacity style={styles.button} disabled>
              <Ionicons name="scan-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Cart")}
            >
              <Ionicons name="cart-outline" size={24} color="black" />
              {cart.length > 0 && (
                <Text>
                  {cart.length}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ),
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Carrito UY" }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ title: "Producto" }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Mi Carrito" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 5,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  }
});