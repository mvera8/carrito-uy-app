import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../components/AppButton";
import { AppIcon } from "../components/AppIcon";
import useTheme from "../hooks/useTheme";

export default function Welcome() {
  const router = useRouter();
	const { colors, insets } = useTheme();

  const handleStart = () => {
    router.replace("/(tabs)");
  };

	const styles = StyleSheet.create({
    container: {
			flex: 1,
			backgroundColor: colors.primary,
			justifyContent: "space-between",
			paddingBottom: insets.bottom,
			paddingLeft: 20,
			paddingRight: 20,
			paddingTop: insets.top
		},
		title: {
			fontSize: 40,
			fontWeight: "bold",
			marginBottom: 10,
			textTransform: "capitalize",
		},
		text: {
			color: "gray",
			fontSize: 22,
			marginBottom: 20,
			paddingRight: 20,
		},
  });

  return (
		<View style={styles.container}>
			<AppIcon
				icon="cart"
				variant="dark"
			/>

			<View style={styles.bottomContent}>
				<Text style={styles.title}>Una forma fácil de ahorrar dinero</Text>
				<Text style={styles.text}>Descubrí en qué súper tu compra cuesta menos.</Text>
				<AppButton
					pressFunction={handleStart}
					text="Comenzar"
					variant="dark"
				/>
			</View>
		</View>
  );
}
