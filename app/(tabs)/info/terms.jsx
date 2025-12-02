import { Text } from "react-native";
import { AppSection, AppHeader } from "../../../components";

export default function Terms() {
  return (
    <AppSection>
			<AppHeader 
				title="Términos de Servicios" 
				showBackButton={true}
			/>

      <Text>Terms</Text>
			<Text>No registros</Text>
			<Text>Guardamos data escaneada. pero anonima</Text>
			<Text>Monetización</Text>
    </AppSection>
  );
}