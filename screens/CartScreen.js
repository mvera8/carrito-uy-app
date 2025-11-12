import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useCart } from "../context/CartContext";

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>El carrito está vacío 😢</Text>
      </View>
    );
  }

  // Obtener todos los supermercados presentes en algún item
  const markets = Array.from(
    new Set(cart.flatMap((product) => product.brands.map((b) => b.market)))
  );

  // Calcular total por supermercado
  const totals = markets.map((market) => {
    let total = 0;
    let missing = false;

    cart.forEach((product) => {
      const found = product.brands.find((b) => b.market === market);

      if (!found) {
        missing = true;
        return;
      }

      // Tomar promo si existe, sino price
      let price = found.promo ?? found.price;

      // Si no hay ninguno → falta el producto
      if (price === undefined || price === null) {
        missing = true;
        return;
      }

      // Si viene como string "653,65" convertir bien
      if (typeof price === "string") {
        price = parseFloat(price.replace(",", "."));
      }

      // Si después de convertir sigue siendo NaN → producto inválido
      if (isNaN(price)) {
        missing = true;
        return;
      }

      total += price * product.quantity;
    });

    return { market, total, missing };
  });

  // Más barato con todos los productos disponibles
  const completeMarkets = totals.filter((t) => !t.missing);
  const bestComplete =
    completeMarkets.length > 0
      ? completeMarkets.reduce((a, b) => (a.total < b.total ? a : b))
      : null;

  // El más barato entre los completos
  let bestOverall = completeMarkets.length
    ? completeMarkets.reduce((a, b) => (a.total < b.total ? a : b))
    : null;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 15 }}>
        Tu carrito ({cart.length} productos únicos)
      </Text>

      {/* Lista de productos */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
            <Text style={{ marginTop: 4 }}>Cantidad: {item.quantity}</Text>

            {/* Controles de cantidad */}
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              <TouchableOpacity
                onPress={() =>
                  updateQuantity(item.id, Math.max(1, item.quantity - 1))
                }
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "#ddd",
                  borderRadius: 6,
                  marginRight: 10,
                }}
              >
                <Text>-</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "#ddd",
                  borderRadius: 6,
                }}
              >
                <Text>+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeFromCart(item.id)}
                style={{
                  marginLeft: "auto",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "black",
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white" }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={{ fontSize: 20, marginVertical: 20 }}>Comparativa total:</Text>

      {totals.map((t) => (
        <Text key={t.market} style={{ marginVertical: 6, fontSize: 16 }}>
          {t.market}: ${t.total.toFixed(0)}
          {t.missing && " (faltan productos)"}

          {/* Si es el más barato con todo */}
          {bestComplete && bestComplete.market === t.market && !t.missing
            ? " ← ⭐ Más barato con todo"
            : ""}
        </Text>
      ))}

    </View>
  );
}
