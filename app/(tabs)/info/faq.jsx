import { Text } from "react-native";
import { AppSection } from "../../../components/AppSection";
import { AppHeader } from "../../../components/AppHeader";

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