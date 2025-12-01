// app/index.jsx
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AppButton, AppIcon, AppSection, TextSmall, AppContainer, TextTitle } from '../components';
import useTheme from "../hooks/useTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@onboarding_completed";

export default function Welcome() {
  const router = useRouter();
  const { colors, insets } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si ya completó el onboarding
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (value === "true") {
        // Si ya completó el onboarding, ir directo a tabs
        router.replace("/(tabs)");
      } else {
        // Mostrar pantalla de bienvenida
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking onboarding:", error);
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      // Guardar que completó el onboarding
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      // Navegar a tabs
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving onboarding:", error);
      // Navegar de todas formas aunque falle el guardado
      router.replace("/(tabs)");
    }
  };

  const styles = StyleSheet.create({
    section: {
      backgroundColor: colors.primary,
    },
		container: {
			justifyContent: "space-between",
			paddingBottom: insets.bottom,
    },
		display: {
      fontSize: 40,
      fontWeight: "bold",
      marginBottom: 10,
      textTransform: "capitalize",
    },
		link: {
      fontWeight: "bold",
			textDecorationLine: "underline"
    },
  });

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <AppSection style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </AppSection>
    );
  }

  return (
    <AppSection style={styles.section}>
			<AppContainer style={styles.container}>
				<AppIcon icon="cart" variant="dark" />

				<View>
					<Text style={styles.display}>Una forma fácil de ahorrar dinero</Text>

					<TextTitle style={{ marginBottom: 20, color: "gray" }}>Descubrí en qué súper tu compra cuesta menos.</TextTitle>

					<AppButton
						style={{ marginBottom: 30 }}
						pressFunction={handleStart}
						text="Comenzar"
						variant="dark"
					/>

					<View>
						<TextSmall style={{ textAlign: "center", display: "block" }}>
							Continuando estas aceptando nuestros
							<Link
								href={'/terms/'}
								style={styles.link}
							>
								{' '}
								<Text>términos y condiciones</Text>
							</Link>.
						</TextSmall>
					</View>

				</View>
			</AppContainer>
    </AppSection>
  );
}