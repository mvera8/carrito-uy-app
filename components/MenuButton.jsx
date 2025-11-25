import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppIcon } from "./AppIcon";
import useTheme from "../hooks/useTheme";

export function MenuButton({
	label,
	icon,
	onPress,
	hideArrow = false
}) {
	const { colors } = useTheme();

	const styles = StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: 15,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		rowText: {
			color: colors.text ,
			fontSize: 16,
			fontWeight: "500",
			textTransform: "capitalize",
			minWidth: 200
		},
	});

	return (
		<TouchableOpacity
      style={styles.row}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
				{icon && <AppIcon icon={icon} size={20} color={colors.text} />}
        <Text style={styles.rowText}>{label}</Text>
      </View>

			{!hideArrow && <AppIcon icon="chevron-forward-outline" variant="transparent" />}
    </TouchableOpacity>
	)
}