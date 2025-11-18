import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useCart } from '../../hooks/useCart';
import useTheme from '../../hooks/useTheme';
import PRICES from '../../data/prices.json';

export default function Cart() {
	const { colors } = useTheme();
	const { cart, removeFromCart, updateQuantity } = useCart();
	
	const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
			padding: 20,
			paddingBottom: 50
    },
    text: {
      color: colors.text,
    },
  });

	// --- LÓGICA DEL CARRITO ---
	const markets = Array.from(
		new Set(
			Object.values(PRICES.data).flatMap((p) =>
				p?.prices ? Object.keys(p.prices) : []
			)
		)
	);

	const totals = markets.map((market) => {
		let total = 0;
		let missing = false;

		cart.forEach((product) => {
			// Buscar los datos del producto dentro de prices.json
			const productData =
				PRICES.data[product.id] ||
				Object.values(PRICES.data).find(
					(p) => p.name.toLowerCase() === product.name.toLowerCase()
				);

			if (!productData) {
				missing = true;
				return;
			}

			// Buscar el precio del supermercado
			const price = productData.prices?.[market]; // ← AHORA SÍ

			if (price === undefined || price === null || isNaN(Number(price))) {
				missing = true;
				return;
			}

			total += Number(price) * product.quantity;
		});

		return { market, total, missing };
	});

	const completeMarkets = totals.filter((t) => !t.missing);

	const bestComplete =
		completeMarkets.length > 0
			? completeMarkets.reduce((a, b) => (a.total < b.total ? a : b))
			: null;

	if (cart.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.text}>El carrito está vacío 😢</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.text}>cart</Text>

			<Text style={{ fontSize: 20, marginBottom: 15 }}>
        Tu carrito ({cart.length} productos únicos)
      </Text>

			<FlatList
				data={cart}
				keyExtractor={(item, index) => String(item.id ?? index)}
				renderItem={({ item }) => (
					<View
						style={{
							paddingVertical: 10,
							borderBottomWidth: 1,
							borderColor: "#ddd",
						}}
					>
						<Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
						<Text style={{ marginTop: 4 }}>Cantidad: {item.quantity}</Text>

						<View style={{ flexDirection: "row", marginTop: 6 }}>
							<TouchableOpacity
								onPress={() =>
									updateQuantity(item.id, Math.max(1, item.quantity - 1))
								}
								style={{
									paddingHorizontal: 12,
									paddingVertical: 6,
									backgroundColor: "#ddd",
									borderRadius: 6,
									marginRight: 10,
								}}
							>
								<Text>-</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => updateQuantity(item.id, item.quantity + 1)}
								style={{
									paddingHorizontal: 12,
									paddingVertical: 6,
									backgroundColor: "#ddd",
									borderRadius: 6,
								}}
							>
								<Text>+</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => removeFromCart(item.id)}
								style={{
									marginLeft: "auto",
									paddingHorizontal: 12,
									paddingVertical: 6,
									backgroundColor: "black",
									borderRadius: 6,
								}}
							>
								<Text style={{ color: "white" }}>Eliminar</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			/>

			<Text style={{ fontSize: 20, marginVertical: 20 }}>Comparativa total:</Text>

			{totals.map((t) => (
				<Text key={t.market} style={{ marginVertical: 6, fontSize: 16 }}>
					{t.market}: ${t.total.toFixed(0)}
					{t.missing && " (faltan productos)"}
					{bestComplete && bestComplete.market === t.market && !t.missing
						? " ← ⭐ Más barato con todo"
						: ""}
				</Text>
			))}
		</View>
	)
}