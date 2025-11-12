import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { PRODUCTS } from "../data/products";

export default function ProductListCompact({ navigation, maxItems = 5 }) {
  const items = PRODUCTS.slice(0, maxItems);

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Productos
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Product", { product: item })}
            style={{
              padding: 14,
              backgroundColor: "#f6f6f6",
              borderRadius: 8,
              marginRight: 12,
              width: 160,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontWeight: "600", textAlign: "center" }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
