import { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import prices from "../data/prices.json";

export function ProductSearch({ onSelect }) {
	const router = useRouter();
  const [search, setSearch] = useState("");

  // Transformamos el JSON a una lista de productos
  const items = Object.entries(prices.data).map(([id, item]) => ({
    id,
    name: item.name,
    prices: item.prices,
  }));

  // Filtrado por nombre
  const filtered =
    search.length > 0
      ? items.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : items;

  function handleSelect(product) {
    setSearch("");
    if (onSelect) onSelect(product);
    router.push({
			pathname: "/product",
			params: { product: JSON.stringify(product) }
		});
  }

  return (
    <View style={{ marginBottom: 10, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Buscar Productos
      </Text>

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
            renderItem={({ item }) => {
              const pricesList = Object.values(item.prices);
              const minPrice =
                pricesList.length > 0
                  ? Math.min(...pricesList)
                  : "N/A";

              return (
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
                    Desde ${minPrice}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}
