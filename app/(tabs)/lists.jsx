
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native'
import useTheme from '../../hooks/useTheme';

export default function Lists() {
	const { colors } = useTheme();
	const [lists, setLists] = useState([]);
	
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

	if (lists.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.text}>No se encontró ninguna lista.</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Listas</Text>
		</View>
	)
}