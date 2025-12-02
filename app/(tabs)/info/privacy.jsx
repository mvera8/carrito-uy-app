import { Text } from "react-native";
import { AppSection, AppHeader } from "../../../components";

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