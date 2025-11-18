import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
} from "react-native";
import { useState, useMemo, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SupermarketCard } from "../components/SupermarketCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../hooks/useCart";
import { SUPERMARKETS } from "../data/supermarkets";
import PRICES from "../data/prices.json";

export default function Product() {
  const router = useRouter();

  // ------------------ PARAMS ------------------
  const params = useLocalSearchParams();

  let product = null;
  try {
    product = params.product ? JSON.parse(params.product) : null;
  } catch (e) {
    console.log("Error parsing params.product:", e);
  }

  // ------------------ CART ------------------
  const { addToCart } = useCart();

  const [useDiscount, setUseDiscount] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);

  // Drawer animation
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (showDrawer) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showDrawer]);

  // ------------------ MATCH PRODUCT ------------------

  // Devuelve { id, ...data }
  const productEntry = useMemo(() => {
    if (!product) return null;

    // Match directo por id
    if (product.id && PRICES.data[product.id]) {
      return { id: product.id, ...PRICES.data[product.id] };
    }

    // Match por slug
    if (product.slug && PRICES.data[product.slug]) {
      return { id: product.slug, ...PRICES.data[product.slug] };
    }

    // Match por nombre
    const match = Object.entries(PRICES.data).find(([key, item]) =>
      product.name
        ?.toLowerCase()
        .includes(item.name.toLowerCase())
    );

    if (match) {
      const [id, data] = match;
      return { id, ...data };
    }

    return null;
  }, [product]);

  if (!productEntry) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No se encontró el producto.</Text>
      </SafeAreaView>
    );
  }

  // ------------------ MARKETS ------------------
  const computedMarkets = useMemo(() => {
    return Object.entries(productEntry.prices)
      .filter(([_, price]) => price && !isNaN(price))
      .map(([market, price]) => {
        const supermarket = SUPERMARKETS.find(
          (s) =>
            s.id === market ||
            s.name.toLowerCase() === market.toLowerCase()
        );

        return {
          market,
          price: Number(price),
          finalPrice: Number(price),
          supermarket,
        };
      });
  }, [productEntry]);

  const maxPrice = useMemo(() => {
    return Math.max(...computedMarkets.map((b) => b.finalPrice));
  }, [computedMarkets]);

  // ------------------ ACTIONS ------------------
  const handleAddToCart = () => {
    addToCart(
      {
        id: productEntry.id, // ← CRUCIAL PARA PODER AGREGAR MÁS DE UNO
        name: productEntry.name,
        prices: productEntry.prices,
      },
      quantity
    );

    setShowDrawer(true);
  };

  const handleContinueShopping = () => {
    setShowDrawer(false);
    setQuantity(1);
  };

  const handleGoToCart = () => {
    setShowDrawer(false);
    router.push("/cart");
  };

  // ------------------ UI ------------------
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 22, marginBottom: 20 }}>
            {productEntry.name}
          </Text>
        </View>

        <FlatList
          contentContainerStyle={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 120,
          }}
          data={computedMarkets}
          keyExtractor={(item) => item.market}
          renderItem={({ item }) => {
            const isMostExpensive =
              item.finalPrice === maxPrice;

            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#f9f9f9",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                {item.supermarket && (
                  <View style={{ marginRight: 10 }}>
                    <SupermarketCard card={item.supermarket} />
                  </View>
                )}

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: isMostExpensive
                        ? "red"
                        : "#000",
                    }}
                  >
                    ${item.finalPrice}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* QUANTITY + ADD */}
        <View style={{ padding: 20, paddingBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setQuantity(Math.max(1, quantity - 1))
              }
              style={{
                padding: 10,
                backgroundColor: "#ddd",
                borderRadius: 6,
                marginHorizontal: 10,
              }}
            >
              <Text>−</Text>
            </TouchableOpacity>

            <Text>{quantity}</Text>

            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={{
                padding: 10,
                backgroundColor: "#ddd",
                borderRadius: 6,
                marginHorizontal: 10,
              }}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            style={{
              backgroundColor: "#000",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: "#fff", fontSize: 18 }}
            >
              Agregar al carrito
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ------------------ DRAWER ------------------ */}
      <Modal
        visible={showDrawer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDrawer(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowDrawer(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <Animated.View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
              transform: [{ translateY: slideAnim }],
            }}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#ddd",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <View
              style={{
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>
                ✓
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 4,
                }}
              >
                Producto agregado
              </Text>
              <Text
                style={{ fontSize: 14, color: "#666" }}
              >
                {quantity} x {productEntry.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleGoToCart}
              style={{
                backgroundColor: "#000",
                padding: 16,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Ver carrito
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleContinueShopping}
              style={{
                backgroundColor: "#f5f5f5",
                padding: 16,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#000",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Seguir comprando
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
