import { View, Switch, StyleSheet } from "react-native";
import { TextTitle } from "./TextTitle";
import useTheme from "../hooks/useTheme";

export function MenuSwitch({
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
	});

	return (
		<View style={[styles.row, { borderBottomColor: colors.border }]}>
			<TextTitle>Dark Mode</TextTitle>
			<Switch
				value={value}
				onValueChange={onValueChange}
				thumbColor={"#fff"}
				trackColor={{ false: colors.border, true: colors.primary }}
			/>
		</View>
	)
}
