// AppInput.jsx
import { TextInput, View, StyleSheet } from "react-native";
import { AppIcon } from "../components/AppIcon";
import useTheme from "../hooks/useTheme";

export function AppInput({ value, changeFunction, placeholder = "Buscar..." }) {
  const { colors, isDarkMode } = useTheme();

	const styles = StyleSheet.create({
		container: {
			flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
			marginBottom: 10,
		},
		input: {
			padding: 12,
			backgroundColor: "transparent", 
			color: colors.text,
			flex: 1,
			borderWidth: 0,
			borderRadius: 8,
			fontSize: 18,
		},
	});

  return (
    <View style={styles.container}>
			<AppIcon icon="search" variant={isDarkMode ? "transparentLight" : "transparent" } />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={changeFunction}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
				autoFocus={false}
      />
    </View>
  );
}
