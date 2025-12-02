import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import useTheme from "../hooks/useTheme";
import { TextTitle } from "./TextTitle";
import { AppIcon } from "./AppIcon";

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
			paddingLeft: colors.appPadding,
			paddingRight: colors.appPadding,
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
	});

  return (
    <View style={styles.container}>
      {/* Botón izquierdo (Back) */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.button}>
            <AppIcon icon="arrow-back" variant="light" />
          </TouchableOpacity>
        )}
      </View>

      {/* Título centrado */}
      <View style={styles.centerSection}>
        <TextTitle numberOfLines={1}>
          {title}
        </TextTitle>
      </View>

      {/* Botón derecho (Icono personalizado) */}
      <View style={styles.rightSection}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.button}>
						<AppIcon icon={rightIcon} variant="lightDark" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
