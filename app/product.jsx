import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SupermarketCard } from "../components/SupermarketCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../hooks/useCart";
import { SUPERMARKETS } from "../data/supermarkets";
import PRICES from "../data/prices.json";
import { AppButton } from "../components/AppButton";
import { AppIcon } from "../components/AppIcon";
import { AppDrawer } from "../components/AppDrawer";
import { AppSection } from "../components/AppSection";
import { AppHeader } from "../components/AppHeader";

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

  const [quantity, setQuantity] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);

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
      .filter(([_, priceData]) => priceData && priceData.price && !isNaN(priceData.price))
      .map(([market, priceData]) => {
        const supermarket = SUPERMARKETS.find(
          (s) =>
            s.id === market ||
            s.name.toLowerCase() === market.toLowerCase()
        );

        return {
          market,
          price: Number(priceData.price),
          finalPrice: Number(priceData.price),
          listPrice: priceData.listPrice,
          promo: priceData.promo,
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
    <AppSection>
			<AppHeader
				title="Producto" 
				showBackButton={true}
			/>

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

								{item.supermarket && (
                  <View style={{ marginRight: 10 }}>
                    <Text>{item.supermarket.name}</Text>
                  </View>
                )}

                <View style={{ alignItems: "flex-end" }}>
                  {item.promo && item.listPrice && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#999",
                        textDecorationLine: "line-through",
                      }}
                    >
                      ${item.listPrice}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: isMostExpensive
                        ? "red"
                        : item.promo
                        ? "green"
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

      <AppDrawer visible={showDrawer} onClose={() => setShowDrawer(false)}>
				<View style={{ alignItems: "center", marginBottom: 24 }}>
					<AppIcon icon="checkmark" />
					<Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
						Producto agregado
					</Text>
					<Text style={{ fontSize: 14, color: "#666" }}>
						{quantity} x {productEntry.name}
					</Text>
				</View>

				<AppButton pressFunction={handleGoToCart} text="Ver carrito" />
				<AppButton
					pressFunction={handleContinueShopping}
					text="Seguir comprando"
					variant="light"
				/>
			</AppDrawer>
    </AppSection>
  );
}