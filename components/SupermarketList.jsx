import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet } from "react-native";
import { SUPERMARKETS } from "../data/supermarkets";
import { SupermarketCard } from "./SupermarketCard";

export const SupermarketList = () => {
  if (!SUPERMARKETS) return null; // seguridad extra

  return (
    <View style={{ paddingTop: 20 }}>
			<Text style={{ paddingLeft: 20, fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>Supermercados</Text>

      {SUPERMARKETS.length === 0 ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : (
        <FlatList
					style={{ paddingLeft: 20 }}
					horizontal
					showsHorizontalScrollIndicator={false}
          data={SUPERMARKETS}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
						<SupermarketCard key={index} card={item} />
          )}
        />
      )}
    </View>
  );
};
