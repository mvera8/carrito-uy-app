import { Text, StyleSheet } from "react-native";
import useTheme from "../hooks/useTheme";

export function TextTitle({ 
  children, 
  style
}) {
	const { colors } = useTheme();

	const styles = StyleSheet.create({
		text_title: {
			color: colors.text,
			fontSize: 20,
			fontWeight: "bold",
			marginBottom: 4,
			marginTop: 4,
			...style,
		},
	});

	return (
		<Text style={styles.text_title}>
			{children}
		</Text>
	)
}