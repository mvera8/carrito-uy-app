
import { useState } from 'react';
import { Text, StyleSheet } from 'react-native'
import { AppSection } from '../../components/AppSection';
import useTheme from '../../hooks/useTheme';

export default function Lists() {
	const { colors } = useTheme();
	const [lists, setLists] = useState([]);
	
	const styles = StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      color: colors.text,
    },
  });

	if (lists.length === 0) {
		return (
			<AppSection style={styles.container}>
				<Text style={styles.text}>No se encontró ninguna lista.</Text>
			</AppSection>
		);
	}

	return (
		<AppSection style={styles.container}>
			<Text style={styles.text}>Listas</Text>
		</AppSection>
	)
}