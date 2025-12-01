import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useCart } from '../../hooks/useCart';
import { AppButton } from '../../components/AppButton';
import { getProductPrice } from '../../lib/getProducts';
import { AppDrawer } from '../../components/AppDrawer';
import { AppSection } from '../../components/AppSection';
import { AppPublicidad } from '../../components/AppPublicidad';
import { TextSmall } from '../../components/TextSmall';
import { AppContainer } from '../../components/AppContainer';
import { SUPERMARKETS } from "../../data/supermarkets";


export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const [showDrawer, setShowDrawer] = useState(false);

  // --- LÓGICA DEL CARRITO ---
  const markets = SUPERMARKETS.map(s => s.id);

  const totals = markets.map((market) => {
    let total = 0;
    let missing = false;

    cart.forEach((product) => {
      const price = getProductPrice(product, market);

      if (price === null || price === undefined || isNaN(price)) {
        missing = true;
        return;
      }

      total += price * product.quantity;
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
      <AppSection>
				<AppContainer>
					<AppPublicidad />
					<TextSmall>El carrito está vacío.</TextSmall>
				</AppContainer>
      </AppSection>
    );
  }

  return (
    <AppSection>
			<AppContainer>
				{totals.map((t) => (
					<Text key={t.market} style={{ marginVertical: 6, fontSize: 16 }}>
						{t.market}: ${t.total.toFixed(0)}
						{t.missing && " (faltan productos)"}
						{bestComplete && bestComplete.market === t.market && !t.missing
							? " ← ⭐ Más barato con todo"
							: ""}
					</Text>
				))}

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

				<AppButton
					pressFunction={() => setShowDrawer(true)}
					text="Guardar lista"
					variant="light"
				/>
			</AppContainer>

      <AppDrawer visible={showDrawer} onClose={() => setShowDrawer(false)}>
        <Text>Nombre Lista</Text>
        <AppButton
          pressFunction={() => setShowDrawer(true)}
          text="Crear lista"
          variant="light"
        />
      </AppDrawer>
    </AppSection>
  );
}