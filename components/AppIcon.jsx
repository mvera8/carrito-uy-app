import { Ionicons } from "@expo/vector-icons";
import useTheme from "../hooks/useTheme";

export function AppIcon({
	icon = "airplane",
	variant = "primary", // "primary" | "dark"| "transparent"
}) {
	const { colors } = useTheme();

	const isPrimary = variant === "primary";

	// Definir estilos según variante
  const getVariantStyles = () => {
    switch (variant) {
      case "dark":
        return {
          backgroundColor: "black",
					textColor: "white"
        };
      case "transparent":
        return {
          backgroundColor: "transparent",
					textColor: colors.primary,
        };
      case "primary":
      default:
        return {
          backgroundColor: colors.primary,
					textColor: "black"
        };
    }
  };

	const variantStyles = getVariantStyles();

	return (
		<Ionicons
			name={icon}
			size={20}
			style={{
				backgroundColor: variantStyles.backgroundColor,
				borderRadius: 999,
				color: variantStyles.textColor,
				width: 50,
				height: 50,
				textAlign: "center",
				lineHeight: 50,
				fontSize: 25,
			}}
		/>
	)
}
