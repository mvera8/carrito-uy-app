import { useState, useMemo, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../hooks/useCart";
import { SUPERMARKETS } from "../data/supermarkets";
import { SupermarketCard, AppButton, AppHeader, AppIcon, AppDrawer, AppSection, AppPublicidad, TextSmall, AppContainer, TextTitle, AppFixedBottom, AppModal } from '../components';
import { getImage } from "../lib/getImage";
import useTheme from "../hooks/useTheme";
import { getProductById } from "../lib/getProducts";

export default function Product() {
  const router = useRouter();
  const { colors, insets } = useTheme();

  // ------------------ PARAMS ------------------
  const params = useLocalSearchParams();
  const productId = params.id;

  // ------------------ STATE ------------------
  const [productQuery, setProductQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------ CART ------------------
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // ------------------ STYLES (ANTES DE CUALQUIER RETURN) ------------------
  const styles = useMemo(() => StyleSheet.create({
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
  }), [colors.primary, insets.top]);

  // ------------------ MARKETS (ANTES DE CUALQUIER RETURN) ------------------
  const computedMarkets = useMemo(() => {
    if (!productQuery?.prices || !Array.isArray(productQuery.prices)) return [];

    return productQuery.prices
      .filter((p) => p.precio && !isNaN(Number(p.precio)))
      .map((p) => {
        const supermarket = SUPERMARKETS.find(
          (s) =>
            s.id === p.tienda ||
            s.name.toLowerCase() === p.tienda.toLowerCase()
        );

        return {
          market: p.tienda,
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
    if (computedMarkets.length === 0) return 0;
    return Math.max(...computedMarkets.map((b) => b.finalPrice));
  }, [computedMarkets]);

  // ------------------ LOAD PRODUCT ------------------
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        
        // Si viene el producto completo en params (backwards compatibility)
        if (params.product) {
          try {
            const parsed = JSON.parse(params.product);
            setProductQuery(parsed);
            setLoading(false);
            return;
          } catch (e) {
            console.log("Error parsing params.product:", e);
          }
        }

        // Si viene solo el ID, buscar en caché/BD
        if (productId) {
          const product = await getProductById(Number(productId));
          setProductQuery(product);
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId, params.product]);

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

  // ------------------ RENDERS CONDICIONALES (DESPUÉS DE TODOS LOS HOOKS) ------------------
  if (loading) {
    return (
      <AppSection>
        <AppHeader 
          title="Cargando..." 
          showBackButton={true}
        />
        <AppContainer>
          <View style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </AppContainer>
      </AppSection>
    );
  }

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

  return (
    <>
      <View style={styles.imageContainer}>
        <AppHeader 
          showBackButton={true}
          rightIcon="attach"
          onRightPress={() => setShowHelpModal(true)}
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
            ListFooterComponent={() => (
              <View style={{ marginTop: 10 }}>
                <AppButton
                  pressFunction={handleContinueShopping}
                  text="Ver Producto web"
                  variant="light"
                />
                <TextSmall>Precios obtenidos del sitio web del supermercado via scrapping, pueden tener descuento pero ese descuento es dependiendo el supermercado.</TextSmall>
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
      </AppSection>

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

      <AppModal visible={showHelpModal} onClose={() => setShowHelpModal(false)}>
        <Image
          alt={productQuery.name}
          style={styles.image}
          source={getImage(productQuery.image)}
        />
      </AppModal>
    </>
  );
}