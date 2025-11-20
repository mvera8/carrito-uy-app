// app/(tabs)/_layout.jsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCart } from "../../hooks/useCart";
import useTheme from "../../hooks/useTheme";

const TabsLayout = () => {
  const { colors } = useTheme();
	const { cart } = useCart();

	const myTabs = [
		{
			name: "index",
			title: "Productos",
			icon: "pricetags",
		},
		{
			name: "cart",
			title: cart.length > 0 ? `Carrito (${cart.length})` : "Carrito",
			icon: "cart",
		},
		{
			name: "scan",
			title: "Scan",
			icon: "scan",
		},
		{
			name: "lists",
			title: "Listas",
			icon: "list",
		},
		{
			name: "info",
			title: "Info",
			icon: "information",
		},
	];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 85,
          paddingBottom: 20,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
			{myTabs.map((tab) => (
				<Tabs.Screen
					key={tab.name}
					name={tab.name}
					options={{
						title: tab.title,
						tabBarIcon: ({ color, size, focused }) => {
							// 👇 Caso especial para la tab "scan"
							// if (tab.name === "scan") {
							// 	return (
							// 		<Ionicons
							// 			name={tab.icon}
							// 			size={size}
							// 			style={{
							// 				backgroundColor: colors.primary,
							// 				borderRadius: 15,
							// 				color: "white",
							// 				shadowOffset: { width: 0, height: 3 },
							// 				width: 60,
							// 				height: 70,
							// 				textAlign: "center",
							// 				lineHeight: 70,
							// 				fontSize: 30,
							// 				marginBottom: 60
							// 			}}
							// 		/>
							// 	);
							// }

							// Todas las otras tabs normales
							return <Ionicons name={tab.icon} size={size} color={color} />;
						},
					}}
				/>
			))}
    </Tabs>
  );
};

export default TabsLayout;