import { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity } from "react-native";
import { PRODUCTS } from "../data/products";

export function ProductSearch({ navigation, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered =
    search.length > 0
      ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
      : [];

  function handleSelect(product) {
    setSearch("");
    if (onSelect) onSelect(product);
    navigation.navigate("Product", { product });
  }

  return (
    <View style={{ marginBottom: 10, padding: 20 }}>
			<Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>Buscar Productos</Text>
      <TextInput
				placeholder="Buscar producto..."
				value={search}
				onChangeText={setSearch}
				autoCapitalize="none"
				placeholderTextColor="#666"
				style={{
					borderWidth: 1,
					borderRadius: 8,
					padding: 10,
					backgroundColor: "white",
					marginBottom: 12,
				}}
			/>

      {/* Lista compacta (solo aparece si hay búsqueda) */}
      {filtered.length > 0 && (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            marginTop: 5,
            backgroundColor: "white",
            maxHeight: 200,
          }}
        >
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                }}
              >
                <Text style={{ fontSize: 16 }}>{item.name}</Text>
                <Text style={{ fontSize: 14, color: "gray" }}>
                  Desde ${Math.min(...item.brands.map((b) => b.price))}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
