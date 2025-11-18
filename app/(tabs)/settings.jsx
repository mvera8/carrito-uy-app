import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import useTheme from '../../hooks/useTheme';

export default function Settings() {
	const { toggleDarkMode, colors } = useTheme();

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
			<Text style={styles.text}>settings</Text>
			<TouchableOpacity
				style={{
					backgroundColor: "#000",
					padding: 14,
					borderRadius: 8,
					alignItems: "center",
					margin: 20,
				}}
				onPress={() => toggleDarkMode()}>
				<Text style={styles.text}>Toggle Dark Mode</Text>
			</TouchableOpacity>
		</View>
	)
}
