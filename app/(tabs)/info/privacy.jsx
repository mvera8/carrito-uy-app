import { Text } from "react-native";
import { AppSection } from "../../../components/AppSection";
import { AppHeader } from "../../../components/AppHeader";

export default function Privacy() {
  return (
    <AppSection>
			<AppHeader 
				title="Política de Privacidad" 
				showBackButton={true}
			/>

      <Text>Privacy</Text>
    </AppSection>
  );
}