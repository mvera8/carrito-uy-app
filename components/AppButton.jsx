import { Text, Pressable } from "react-native";
import useTheme from "../hooks/useTheme";

export function AppButton({ 
  pressFunction, 
  text, 
  variant = "primary", // "primary" | "light" | "dark"
  style 
}) {
	const { colors, isDarkMode } = useTheme();

  // Definir estilos según variante
  const getVariantStyles = () => {
    switch (variant) {
      case "dark":
        return {
          backgroundColor: "#000",
          textColor: "#fff",
        };
      case "light":
        return {
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          textColor: colors.text,
        };
      case "primary":
      default:
        return {
          backgroundColor: colors.primary,
          textColor: "#fff",
        };
    }
  };

  const variantStyles = getVariantStyles();
  
  return (
    <Pressable
      onPress={pressFunction}
      style={{
        backgroundColor: variantStyles.backgroundColor,
        padding: 20,
				paddingBottom: 15,
				paddingTop: 15,
        borderRadius: 999,
        alignItems: "center",
        marginBottom: colors.marginBottom,
        ...style,
      }}
    >
      <Text
        style={{
          color: variantStyles.textColor,
          fontSize: 22,
          fontWeight: "600",
        }}
      >
        {text}
      </Text>
    </Pressable>
  );
}