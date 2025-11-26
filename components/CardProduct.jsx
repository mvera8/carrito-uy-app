import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { TextSmall } from "./TextSmall";
import { TextTitle } from "./TextTitle";
import useTheme from "../hooks/useTheme";

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
    image: {
      backgroundColor: "white",
      borderRadius: 99,
      height: 60,
      marginRight: 15,
      width: 60,
      flexShrink: 0,
    },
    textContainer: {
      flex: 1,
      flexShrink: 1,
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
      <View style={styles.textContainer}>
        <TextTitle numberOfLines={2}>{product.name}</TextTitle>
        <TextSmall>
          Desde ${minPrice}
        </TextSmall>
      </View>
    </TouchableOpacity>
  );
}