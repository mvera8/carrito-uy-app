import { Ionicons } from "@expo/vector-icons";
import useTheme from "../hooks/useTheme";

export function AppIcon({
	icon = "airplane",
	variant = "primary", // "primary" | "dark"
}) {
	const { colors } = useTheme();

	const isPrimary = variant === "primary";

	return (
		<Ionicons
			name={icon}
			size={20}
			style={{
				backgroundColor: isPrimary ? colors.primary : "#000",
				borderRadius: 999,
				color: "white",
				width: 50,
				height: 50,
				textAlign: "center",
				lineHeight: 50,
				fontSize: 25,
				marginBottom: 15
			}}
		/>
	)
}
