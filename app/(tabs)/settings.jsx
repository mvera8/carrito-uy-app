import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native'
import useTheme from '../../hooks/useTheme';

export default function Settings() {
	const { isDarkMode, toggleDarkMode, colors } = useTheme();

	const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.bg,
    },
		text: {
      color: colors.text,
    },
  });
	
	return (
		<View style={styles.container}>
			<Text>settings</Text>

			{/* DARK MODE */}
      <View>
        <Text>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
		</View>
	)
}
