// app/(tabs)/index.jsx
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { getProducts } from '../../lib/getProducts';
import { AppInput, AppHeader, AppSpiner, AppSection, AppPublicidad, CardProduct, TextSmall, AppContainer } from '../../components';

export default function Index() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
		async function load() {
			const prods = await getProducts();
			setProducts(prods);
		}
		load();
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
			<AppHeader title="PagáMenos" />
			<AppContainer>
				<AppPublicidad />
				{products.length === 0 ? (
					<AppSpiner />
				) : (
					<>
						<AppInput value={search} changeFunction={setSearch} />
						{filtered.length === 0 ? (
							<TextSmall>No se encontró el producto</TextSmall>
						) : (
							<FlatList
								data={filtered}
								keyExtractor={(item) => item.id}
								renderItem={({ item }) => {
									const pricesList = item.prices?.map(p => Number(p.precio)) || [];
									const minPrice =
										pricesList.length > 0
											? Math.min(...pricesList)
											: "N/A";

									return (
										<CardProduct
											product={item}
											minPrice={minPrice}
											pressFunction={() => handleSelect(item)}
										/>
									);
								}}
							/>
						)}
					</>
				)}
			</AppContainer>
    </AppSection>
  );
}