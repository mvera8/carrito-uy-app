import { Text, View, Switch, StyleSheet } from "react-native";
import useTheme from "../hooks/useTheme";

export function MenuSwitch({
	label,
	value,
	onValueChange
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
		<View style={[styles.row, { borderBottomColor: colors.border }]}>
			<Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
			<Switch
				value={value}
				onValueChange={onValueChange}
				thumbColor={"#fff"}
				trackColor={{ false: colors.border, true: colors.primary }}
			/>
		</View>
	)
}
