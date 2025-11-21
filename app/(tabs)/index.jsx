import { useEffect, useState } from 'react';
import { StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getLatestProducts } from '../../lib/products';
import { AppInput } from '../../components/AppInput';
import { AppHeader } from '../../components/AppHeader';
import { AppSpiner } from '../../components/AppSpiner';
import { AppSection } from '../../components/AppSection';
import { AppPublicidad } from '../../components/AppPublicidad';
import useTheme from '../../hooks/useTheme';

export default function Index() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const { colors } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    text: {
      color: colors.text,
    },
  });

  useEffect(() => {
    getLatestProducts().then((products) => {
      setProducts(products);
    });
  }, []);

	// Filtrado por nombre
  const filtered =
    search.length > 0
      ? products.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : products;

  function handleSelect(product) {
    router.push({
      pathname: "/product",
      params: { product: JSON.stringify(product) }
    });
  }

  return (
    <AppSection>
      <AppHeader 
        title="+Barato" 
      />

			<AppPublicidad />

      {products.length === 0 ? (
        <AppSpiner />
      ) : (
        <>
					<AppInput
						value={search}
						changeFunction={setSearch}
					/>
          {filtered.length === 0 ? (
						<Text style={{ color: "gray" }}>No se encontro el producto</Text>
					) : (
						<>
							
							<FlatList
								data={filtered}
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
        </>
      )}
    </AppSection>
  );
}