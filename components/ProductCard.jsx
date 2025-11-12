import { View, StyleSheet, Text } from "react-native";

export function ProductCard({ product }) {
  return (
    <View key={product.id} style={styles.card}>
     <Text style={{ color: "#fff", fontSize: 18 }}>{product.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 42,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
});