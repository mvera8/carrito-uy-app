import { View, ActivityIndicator } from "react-native";
import useTheme from "../hooks/useTheme";

export function AppSpiner() {
	const { colors } = useTheme();

	return (
		<View style={{ padding: 20 }}>
			<ActivityIndicator color={colors.primary} size="large" />
		</View>
	)
}
