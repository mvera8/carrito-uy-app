import { Text, StyleSheet } from "react-native";
import useTheme from "../hooks/useTheme";

export function TextSmall({ 
  children, 
  style
}) {
	const { colors } = useTheme();

	const styles = StyleSheet.create({
		text_small: {
			color: "gray",
			fontSize: 16,
   		lineHeight: 20,
			marginBottom: 4,
			...style,
		},
	});

	return (
		<Text style={styles.text_small}>
			{children}
		</Text>
	)
}