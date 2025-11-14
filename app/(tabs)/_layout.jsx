import { useTheme } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCart } from '../../context/CartContext';

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
			name: "list",
			title: "Lista",
			icon: "list",
		},
		{
			name: "settings",
			title: "Settings",
			icon: "settings",
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
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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
						tabBarIcon: ({ color, size }) => (
							<Ionicons name={tab.icon} size={size} color={color} />
						),
					}}
				/>
			))}

      <Tabs.Screen
        name="product"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;