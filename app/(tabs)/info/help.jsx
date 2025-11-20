// app/(tabs)/info/help.jsx
import { Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { AppSection } from "../../../components/AppSection";
import { AppHeader } from "../../../components/AppHeader";

export default function Help() {
  return (
    <AppSection>
			<AppHeader />
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ marginBottom: 20 }}>← Volver</Text>
      </TouchableOpacity>

      <Text>help</Text>
    </AppSection>
  );
}
