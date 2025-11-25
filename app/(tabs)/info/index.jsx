// app/(tabs)/info/index.jsx
import { FlatList } from "react-native";
import { router } from "expo-router";
import { AppSection } from "../../../components/AppSection";
import { MenuButton } from "../../../components/MenuButton";
import { AppHeader } from "../../../components/AppHeader";
import { MenuSwitch } from "../../../components/MenuSwitch";
import useTheme from "../../../hooks/useTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContainer } from "../../../components/AppContainer";

const menu = [
  { label: "Ayuda", icon: "chatbubble", link: "/info/help" },
  { label: "Preguntas Frecuentes", icon: "help-circle", link: "/info/faq" },
  { label: "Invitar Amigos", icon: "share-social", link: "/info/invite" },
  { label: "Términos de Servicios", icon: "document-text", link: "/info/terms" },
  { label: "Política de Privacidad", icon: "shield", link: "/info/privacy" },
];

export default function Info() {
  const { toggleDarkMode, isDarkMode } = useTheme();

	async function handleReload() {
    try {
      await AsyncStorage.removeItem("@onboarding_completed");
      // Opcional: reiniciar la app o navegar al inicio
      router.replace("/");
    } catch (error) {
      console.error("Error removing onboarding:", error);
    }
  }

  return (
    <AppSection>
			<AppHeader
				title="Información"
			/>
			<AppContainer>
				<MenuSwitch
					label={isDarkMode ? "Modo claro" : "Modo oscuro" }
					value={isDarkMode}
					onValueChange={toggleDarkMode}
				/>

				<FlatList
					data={menu}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({ item }) => (
						<MenuButton
							label={item.label}
							icon={item.icon}
							onPress={() => router.push(item.link)}
						/>
					)}
				/>

				<MenuButton
					label="Reload"
					onPress={() => handleReload()}
				/>
			</AppContainer>
    </AppSection>
  );
}
