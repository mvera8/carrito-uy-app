import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import useTheme from "../hooks/useTheme";

export function AppHeader({ 
  title, 
  showBackButton = false, 
  rightIcon,
  onRightPress 
}) {
  const router = useRouter();
	const { colors } = useTheme();

  const handleBackPress = () => {
    router.back();
  };
	
	const styles = StyleSheet.create({
		container: {
			height: 56,
			flexDirection: "row",
			alignItems: "center",
		},
		leftSection: {
			width: 60,
			justifyContent: "center",
			alignItems: "flex-start",
		},
		centerSection: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
		rightSection: {
			width: 60,
			justifyContent: "center",
			alignItems: "flex-end",
		},
		button: {
			padding: 8,
			justifyContent: "center",
			alignItems: "center",
		},
		backIcon: {
			fontSize: 24,
			color: colors.text,
		},
		title: {
			fontSize: 18,
			fontWeight: "600",
			color: colors.text,
		},
	});

  return (
    <View style={styles.container}>
      {/* Botón izquierdo (Back) */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.button}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Título centrado */}
      <View style={styles.centerSection}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Botón derecho (Icono personalizado) */}
      <View style={styles.rightSection}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.button}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
