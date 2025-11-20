import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native'
import { getLatestProducts } from '../../lib/products';
import { AppInput } from '../../components/AppInput';
import { AppHeader } from '../../components/AppHeader';
import useTheme from '../../hooks/useTheme';

export default function Index() {
	const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const { colors, insets } = useTheme();

  const styles = StyleSheet.create({
    container: {
			flex: 1,
			backgroundColor: colors.bg,
			paddingLeft: 20,
			paddingRight: 20,
			paddingTop: insets.top
		},
		text: {
      color: colors.text,
    },
  });

  useEffect(() => {
    getLatestProducts().then((products) => {
      setProducts(products);
    });
  }, []);

	function handleSelect(product) {
    if (onSelect) onSelect(product);
    router.push({
			pathname: "/product",
			params: { product: JSON.stringify(product) }
		});
  }

  return (
    <View style={styles.container}>
      <AppHeader />

      {products.length === 0 ? (
        <ActivityIndicator color={"#fff"} size={"large"} />
      ) : (
				<>
					<AppInput
						value={search}
						changeFunction={setSearch}
					/>
					<FlatList
						data={products}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => {
							const pricesList = Object.values(item.prices).map(p => p.price);
							const minPrice =
								pricesList.length > 0
									? Math.min(...pricesList)
									: "N/A";

							return (
								<TouchableOpacity
									onPress={() => handleSelect(item)}
									style={{
										backgroundColor: "rgba(255,255,255,0.1)",
										borderColor: "gray",
										borderStyle: "solid",
										borderRadius: 8,
										borderWidth: 1,
										marginBottom: 4,
										padding: 10,
									}}
								>
									<Text style={styles.text}>{item.name}</Text>
									<Text style={{ color: "gray" }}>
										Desde ${minPrice}
									</Text>
								</TouchableOpacity>
							);
						}}
					/>
				</>
      )}
    </View>
  )
}