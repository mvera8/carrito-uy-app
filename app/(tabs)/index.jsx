// app/(tabs)/index.jsx
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { getLatestProducts } from '../../lib/getProducts';
import { AppInput } from '../../components/AppInput';
import { AppHeader } from '../../components/AppHeader';
import { AppSpiner } from '../../components/AppSpiner';
import { AppSection } from '../../components/AppSection';
import { AppPublicidad } from '../../components/AppPublicidad';
import { CardProduct } from '../../components/CardProduct';
import { TextSmall } from '../../components/TextSmall';
import { AppContainer } from '../../components/AppContainer';

export default function Index() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const router = useRouter();

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
			<AppHeader title="+Barato" />
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
									const pricesList = Object.values(item.prices).map(p => p.price);
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