import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../components/AppButton";
import { AppIcon } from "../components/AppIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";

export default function Welcome() {
  const router = useRouter();
	const { colors } = useTheme();

  const handleStart = () => {
    router.replace("/(tabs)");
  };

	const styles = StyleSheet.create({
    container: {
			flex: 1,
			padding: 20,
			backgroundColor: colors.primary,
			justifyContent: "space-between",
		},
		title: {
			fontSize: 24,
			fontWeight: "bold",
			marginBottom: 20,
			textTransform: "capitalize",
		},
  });

  return (
		<SafeAreaView style={styles.container}>
			<AppIcon
				icon="cart-outline"
				variant="dark"
			/>

			<View style={styles.bottomContent}>
				<Text style={styles.title}>Easy way to save your money</Text>
				<AppButton
					pressFunction={handleStart}
					text="Comenzar"
					variant="dark"
				/>
			</View>
		</SafeAreaView>
  );
}
