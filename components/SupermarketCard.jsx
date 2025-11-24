import { View, StyleSheet, Text, Image } from "react-native";

export function SupermarketCard({ card }) {
  return (
		<View key={card.id} style={styles.card_template}>
      <Image
				alt={card.name}
        style={styles.card_image}
        source={card.image}
    	/>
   </View>
  );
}

const styles = StyleSheet.create({
  card_template:{
    width: 100,
		overflow: "hidden",
		marginRight: 20,
    height: 70,
		borderRadius : 10,
  },
  card_image: {
    width: 100,
		resizeMode: "contain",
    height: 70,
		backgroundColor: "white"
  },
});
