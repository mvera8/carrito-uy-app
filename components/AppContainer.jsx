import { StyleSheet, View } from "react-native";
import useTheme from "../hooks/useTheme";

export function AppContainer({
	children,
	style
}) {
	const { colors } = useTheme();

	const styles = StyleSheet.create({
    container: {
			flex: 1,
			paddingLeft: colors.appPadding,
			paddingRight: colors.appPadding,
			...style,
		},
  });

	return (
		<View style={styles.container}>
			{children}
		</View>
	)
}
