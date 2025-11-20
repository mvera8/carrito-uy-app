import { StyleSheet, View } from "react-native";
import useTheme from "../hooks/useTheme";

export function AppSection({
	children,
	style
}) {
	const { colors, insets } = useTheme();

	const styles = StyleSheet.create({
    container: {
			flex: 1,
			backgroundColor: colors.bg,
			paddingLeft: 20,
			paddingRight: 20,
			paddingTop: insets.top,
			...style,
		},
  });

	return (
		<View style={styles.container}>
			{children}
		</View>
	)
}
