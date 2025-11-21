import { Text, StyleSheet } from "react-native";
import useTheme from "../hooks/useTheme";

export function AppPublicidad() {
	const { colors } = useTheme();

	const styles = StyleSheet.create({
		ad: {
			textAlign: "center",
			backgroundColor: colors.primary,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 15,
			marginBottom: 10,
			padding: 40
		},
	});

	return (
		<Text style={styles.ad}>AppPublicidad</Text>
	)
}