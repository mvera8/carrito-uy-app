import { Text } from "react-native";
import { AppSection, AppHeader } from "../../../components";

export default function Faq() {
  return (
    <AppSection>
			<AppHeader 
				title="Preguntas Frecuentes" 
				showBackButton={true}
			/>

      <Text>Faq</Text>
    </AppSection>
  );
}