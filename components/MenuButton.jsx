import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppIcon } from "./AppIcon";
import useTheme from "../hooks/useTheme";
import { TextTitle } from "./TextTitle";

export function MenuButton({
	label,
	icon,
	onPress,
	hideArrow = false
}) {
	const { colors, isDarkMode } = useTheme();

	const styles = StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: 15,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
	});

	return (
		<TouchableOpacity
      style={styles.row}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
				{icon && <AppIcon icon={icon} />}
        <TextTitle>{label}</TextTitle>
      </View>

			{!hideArrow && <AppIcon icon="chevron-forward-outline" variant={isDarkMode ? "transparentLight" : "transparent" } />}
    </TouchableOpacity>
	)
}