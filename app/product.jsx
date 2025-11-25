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
import { TextTitle } from "../components/TextTitle";
import { AppPublicidad } from "../components/AppPublicidad";
import { TextSmall } from "../components/TextSmall";
import { AppFixedBottom } from "../components/AppFixedBottom";
import { AppContainer } from "../components/AppContainer";
import useTheme from "../hooks/useTheme";

export default function Product() {
  const router = useRouter();
	const { colors, insets } = useTheme();

	const styles = StyleSheet.create({
		imageContainer: {
			alignItems: "center",
      backgroundColor: colors.primary,
			paddingTop: insets.top,
    },
		image: {
			display: "block",
      height: 200,
			width: 200
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
      <AppSection>
				<AppHeader 
					title="Error" 
					showBackButton={true}
				/>
				<AppContainer>
					<Text>No se encontró el producto.</Text>
				</AppContainer>
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
      })
      .sort((a, b) => a.finalPrice - b.finalPrice);
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
		<>
		<View style={styles.imageContainer}>
			<AppHeader 
				showBackButton={true}
			/>
			<Image
				alt={product.name}
				style={styles.image}
				source={product.image || require('../assets/products/image_cart.png')}
			/>
		</View>
    <AppSection style={{ paddingTop: 20 }}>
      <AppContainer>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
						gap: 10,
          }}
        >
					<TextTitle style={{ flex: 1 }}>{product.name}</TextTitle>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
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
        </View>

        <FlatList
          data={computedMarkets}
          keyExtractor={(item) => item.market}
					ListHeaderComponent={() => (
            <View style={{ marginBottom: 10 }}>
              <AppPublicidad />
							<TextSmall>Precio en supermercados:</TextSmall>
            </View>
          )}
          renderItem={({ item }) => {
            const isMostExpensive = item.finalPrice === maxPrice;

            return (
              <View style={{ marginBottom: 10, backgroundColor: colors.surface, padding: 10, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
									{item.supermarket && (
										<View style={{ marginRight: 10 }}>
											<SupermarketCard card={item.supermarket} />
										</View>
									)}

									{item.supermarket && (
										<View style={{ marginRight: 10 }}>
											<TextTitle>{item.supermarket.name}</TextTitle>
										</View>
									)}
								</View>

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
      </AppContainer>

			<AppFixedBottom>
				<AppButton
					pressFunction={handleAddToCart}
					text="Agregar al carrito"
					variant="dark"
				/>
			</AppFixedBottom>

      <AppDrawer visible={showDrawer} onClose={() => setShowDrawer(false)}>
        <View style={{ alignItems: "center", marginBottom: 24, gap: 10 }}>
          <AppIcon icon="checkmark" />
					<TextTitle>Producto agregado</TextTitle>
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
		</>
  );
}