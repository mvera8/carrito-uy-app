import { useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../hooks/useCart";
import { SUPERMARKETS } from "../data/supermarkets";
import { SupermarketCard, AppButton, AppHeader, AppIcon, AppDrawer, AppSection, AppPublicidad, TextSmall, AppContainer, TextTitle, AppFixedBottom } from '../components';
import { getImage } from "../lib/getImage";
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
  if (!productQuery) {
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
		if (!productQuery.prices || !Array.isArray(productQuery.prices)) return [];

		return productQuery.prices
			.filter((p) => p.precio && !isNaN(Number(p.precio)))
			.map((p) => {
				const supermarket = SUPERMARKETS.find(
					(s) =>
						s.id === p.tienda ||
						s.name.toLowerCase() === p.tienda.toLowerCase()
				);

				return {
					market: p.tienda,           // antes venía de Object.entries
					price: Number(p.precio),
					finalPrice: Number(p.precio),
					listPrice: p.listPrice || null,
					promo: p.promo || null,
					url: p.url,
					supermarket,
				};
			})
			.sort((a, b) => a.finalPrice - b.finalPrice);
	}, [productQuery]);

  const maxPrice = useMemo(() => {
    return Math.max(...computedMarkets.map((b) => b.finalPrice));
  }, [computedMarkets]);

  // ------------------ ACTIONS ------------------
  const handleAddToCart = () => {
    addToCart(
      {
        id: productQuery.id,
        name: productQuery.name,
        image: productQuery.image,
        prices: productQuery.prices,
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
				alt={productQuery.name}
				style={styles.image}
				source={getImage(productQuery.image)}
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
					<TextTitle style={{ flex: 1 }}>{productQuery.name}</TextTitle>

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
					<TextTitle>producto agregado</TextTitle>
          <Text style={{ fontSize: 14, color: "#666" }}>
            {quantity} x {productQuery.name}
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