import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SupermarketCard } from "../components/SupermarketCard";
import { useCart } from "../hooks/useCart";
import { SUPERMARKETS } from "../data/supermarkets";
import { AppButton } from "../components/AppButton";
import { AppIcon } from "../components/AppIcon";
import { AppDrawer } from "../components/AppDrawer";
import { AppSection } from "../components/AppSection";
import { AppHeader } from "../components/AppHeader";
import { findProduct } from "../lib/getProducts";
import useTheme from "../hooks/useTheme";

export default function Product() {
  const router = useRouter();
	const { colors } = useTheme();

	const styles = StyleSheet.create({
    image: {
      backgroundColor: "white",
      borderRadius: 99,
      height: 44,
      marginRight: 30,
      width: 44,
    },
		container: {
      alignItems: "center",
    },
    text: {
      color: colors.text,
    },
  });

  // ------------------ PARAMS ------------------
  const params = useLocalSearchParams();

  let productQuery = null;
  try {
    productQuery = params.product ? JSON.parse(params.product) : null;
  } catch (e) {
    console.log("Error parsing params.product:", e);
  }

  // ------------------ CART ------------------
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);

  // ------------------ FIND PRODUCT ------------------
  const product = useMemo(() => {
    return findProduct(productQuery);
  }, [productQuery]);

  if (!product) {
    return (
      <AppSection style={styles.container}>
				<AppHeader 
					title="Error" 
					showBackButton={true}
				/>
        <Text>No se encontró el producto.</Text>
      </AppSection>
    );
  }

  // ------------------ MARKETS ------------------
  const computedMarkets = useMemo(() => {
    return Object.entries(product.prices)
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
  }, [product]);

  const maxPrice = useMemo(() => {
    return Math.max(...computedMarkets.map((b) => b.finalPrice));
  }, [computedMarkets]);

  // ------------------ ACTIONS ------------------
  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        image: product.image,
        prices: product.prices,
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

  return (
    <AppSection>
      <AppHeader
        title="Detalles del Producto" 
        showBackButton={true}
      />

      <View style={{ flex: 1 }}>
        <View>
          <Image
            alt={product.name}
            style={styles.image}
            source={product.image || require('../assets/products/image_cart.png')}
          />
          <Text style={{ fontSize: 22, marginBottom: 20 }}>
            {product.name}
          </Text>
        </View>

        <FlatList
          data={computedMarkets}
          keyExtractor={(item) => item.market}
          renderItem={({ item }) => {
            const isMostExpensive = item.finalPrice === maxPrice;

            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#f9f9f9",
                  borderRadius: 8,
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
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
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
            <Text style={{ color: "#fff", fontSize: 18 }}>
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
            {quantity} x {product.name}
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