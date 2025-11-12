import { View, Text, FlatList, TouchableOpacity, Linking, Switch } from "react-native";
import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { ProductSearch } from "../components/ProductSearch";
import { SupermarketCard } from "../components/SupermarketCard";
import { SUPERMARKETS } from "../data/supermarkets";
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

export default function ProductScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();

  const [useDiscount, setUseDiscount] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Calculamos precios, convirtiendo promo si viene como string "653,65"
  const computedBrands = useMemo(() => {
    return product.brands
      .filter((b) => b.price) // Descartamos entries vacíos como Disco en el repelente
      .map((item) => {
        const numericPromo = item.promo
          ? typeof item.promo === "string"
            ? Number(item.promo.replace(",", "."))
            : item.promo
          : null;

        const finalPrice = useDiscount && numericPromo ? numericPromo : item.price;
        const potentialSavings = numericPromo ? item.price - numericPromo : 0;

        // Buscar el supermercado correspondiente
        const supermarket = SUPERMARKETS.find(
          (s) => s.id === item.market || s.name.toLowerCase() === item.market.toLowerCase()
        );

        return { ...item, finalPrice, numericPromo, potentialSavings, supermarket };
      });
  }, [product.brands, useDiscount]);

  // Detectar el precio más caro
  const maxPrice = useMemo(() => {
    return Math.max(...computedBrands.map((b) => b.finalPrice));
  }, [computedBrands]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingBottom: 20 }}>
        <FlatList
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          data={computedBrands}
          keyExtractor={(item) => item.market}
          ListHeaderComponent={
            <View>
              <ProductSearch navigation={navigation} />
              <Text style={{ fontSize: 22, marginBottom: 10 }}>{product.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Switch value={useDiscount} onValueChange={setUseDiscount} />
                <Text style={{ marginLeft: 10, fontSize: 16 }}>Usar descuento</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const isMostExpensive = item.finalPrice === maxPrice;
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "red",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                {/* Icono/Logo del supermercado */}
                {item.supermarket && (
                  <View>
                    <SupermarketCard card={item.supermarket} />
                  </View>
                )}

                {/* Contenido central */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 2 }}>
                    {item.market}
                  </Text>
                  <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                    <Text style={{ fontSize: 13, color: "#666" }}>Ver en sitio →</Text>
                  </TouchableOpacity>
                </View>

                {/* Precio a la derecha */}
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

                  {/* Mostrar descuento o precio anterior */}
                  {item.numericPromo && useDiscount ? (
                    <Text style={{ fontSize: 13, color: "#999", textDecorationLine: "line-through" }}>
                      ${item.price}
                    </Text>
                  ) : item.numericPromo && !useDiscount ? (
                    <Text style={{ fontSize: 13, color: "green" }}>
                      -${item.potentialSavings.toFixed(0)}
                    </Text>
                  ) : null}
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
          padding: 16,
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
            marginBottom: 10,
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
            <Text style={{ fontSize: 20 }}>−</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: "bold" }}>{quantity}</Text>

          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={{
              padding: 10,
              backgroundColor: "#ddd",
              borderRadius: 6,
              marginHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 20 }}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => addToCart(product, quantity)}
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