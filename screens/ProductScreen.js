import { View, Text, FlatList, TouchableOpacity, Switch } from "react-native";
import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { SupermarketCard } from "../components/SupermarketCard";
import { SUPERMARKETS } from "../data/supermarkets";
import { SafeAreaView } from "react-native-safe-area-context";
import PRICES from "../data/prices.json";

export default function ProductScreen({ route }) {
  const { product } = route.params;
  const { addToCart } = useCart();

  const [useDiscount, setUseDiscount] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Intentamos buscar el producto por su id, slug o nombre
  const productData =
    PRICES.data[product?.id] ||
    PRICES.data[product?.slug] ||
    Object.entries(PRICES.data).find(([key, item]) =>
      product?.name?.toLowerCase().includes(item.name.toLowerCase())
    )?.[1];

  // Si no se encuentra, mostramos mensaje
  if (!productData)
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No se encontró el producto.</Text>
      </SafeAreaView>
    );

  // Convertimos los precios del producto en un array usable
  const computedMarkets = useMemo(() => {
    return Object.entries(productData.prices)
      .filter(([_, price]) => price && !isNaN(price))
      .map(([market, price]) => {
        const supermarket = SUPERMARKETS.find(
          (s) => s.id === market || s.name.toLowerCase() === market.toLowerCase()
        );

        return {
          market,
          price: Number(price),
          finalPrice: Number(price),
          supermarket,
        };
      });
  }, [productData]);

  // Detectar el precio más alto (para marcarlo)
  const maxPrice = useMemo(() => {
    return Math.max(...computedMarkets.map((b) => b.finalPrice));
  }, [computedMarkets]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 120 }}
          data={computedMarkets}
          keyExtractor={(item) => item.market}
          ListHeaderComponent={
            <View>
              <Text style={{ fontSize: 22, marginBottom: 20 }}>{productData.name}</Text>

              {/* Si el producto tiene descuento, permitimos activar/desactivar */
                productData.discountPrice && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <Switch value={useDiscount} onValueChange={setUseDiscount} />
                    <Text style={{ marginLeft: 10, fontSize: 16 }}>Usar descuento</Text>
                  </View>
                ) 
              }
            </View>
          }
          renderItem={({ item }) => {
            const isMostExpensive = item.finalPrice === maxPrice;
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
                {/* Logo del supermercado */}
                {item.supermarket && (
                  <View style={{ marginRight: 10 }}>
                    <SupermarketCard card={item.supermarket} />
                  </View>
                )}

                {/* Precio */}
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: isMostExpensive ? "red" : "#000",
                    }}
                  >
                    ${item.finalPrice}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* Botón fijo abajo */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 20,
          paddingBottom: 32,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
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
          onPress={() => addToCart(productData, quantity)}
          style={{
            backgroundColor: "#000",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18 }}>Agregar al carrito</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
