import { Text, StyleSheet, TouchableOpacity, Image, View } from "react-native";
import useTheme from "../hooks/useTheme";
import { TextSmall } from "./TextSmall";

export function CardProduct({
  pressFunction,
  product,
  minPrice
}) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.1)",
      borderColor: "gray",
      borderStyle: "solid",
      borderRadius: colors.cardRadius,
      borderWidth: 1,
      marginBottom: 10,
      padding: 10,
    },
    text: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "500",
    },
    image: {
      backgroundColor: "white",
      borderRadius: 99,
      height: 60,
      marginRight: 30,
      width: 60,
    },
  });

  return (
    <TouchableOpacity
      onPress={pressFunction}
      style={styles.card}
    >
      <Image
        alt={product.name}
        style={styles.image}
        source={product.image || require('../assets/products/image_cart.png')}
      />
      <View>
        <Text style={styles.text}>{product.name}</Text>
				<TextSmall>
					Desde ${minPrice}
				</TextSmall>
      </View>
    </TouchableOpacity>
  );
}