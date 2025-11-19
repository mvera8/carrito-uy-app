import { View, StyleSheet } from 'react-native'
import { ProductSearch } from '../../components/ProductSearch'
import useTheme from '../../hooks/useTheme';

export default function Index() {
	const { colors } = useTheme();

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.bg,
		},
	});

	return (
		<View style={styles.container}>
			<ProductSearch />
		</View>
	)
}