import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../components/AppButton";
import { AppIcon } from "../components/AppIcon";
import useTheme from "../hooks/useTheme";
import { AppSection } from "../components/AppSection";

export default function Welcome() {
  const router = useRouter();
	const { colors, insets } = useTheme();

  const handleStart = () => {
    router.replace("/(tabs)");
  };

	const styles = StyleSheet.create({
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
		<AppSection style={{
			backgroundColor: colors.primary,
			justifyContent: "space-between",
			paddingBottom: insets.bottom,
		}}>
			<View style={{ paddingTop: 20 }}>
				<AppIcon
					icon="cart"
					variant="dark"
				/>
			</View>

			<View style={{ paddingBottom: 20 }}>
				<Text style={styles.title}>Una forma fácil de ahorrar dinero</Text>
				<Text style={styles.text}>Descubrí en qué súper tu compra cuesta menos.</Text>
				<AppButton
					pressFunction={handleStart}
					text="Comenzar"
					variant="dark"
				/>
			</View>
		</AppSection>
  );
}
