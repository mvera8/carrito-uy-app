import { StyleSheet, View } from "react-native";
import useTheme from "../hooks/useTheme";

export function AppFixedBottom({
	children,
	style
}) {
	const { colors, insets } = useTheme();

	const styles = StyleSheet.create({
    container: {
			backgroundColor: colors.bg,
			borderTopWidth: 1,
      borderTopColor: "red",
			padding: colors.appPadding,
			paddingBottom: insets.bottom,
			...style,
		},
  });

	return (
		<View style={styles.container}>
			{children}
		</View>
	)
}
