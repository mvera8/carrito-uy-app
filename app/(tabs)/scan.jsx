import { View, Text, StyleSheet } from 'react-native'
import useTheme from '../../hooks/useTheme';

const scan = () => {
	const { colors } = useTheme();
	
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
			<Text>scan</Text>
		</View>
	)
}

export default scan