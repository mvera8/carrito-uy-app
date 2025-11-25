// app/(tabs)/info/help.jsx
import { Text } from "react-native";
import { AppSection } from "../../../components/AppSection";
import { AppHeader } from "../../../components/AppHeader";
import { AppContainer } from "../../../components/AppContainer";

export default function Help() {
  return (
    <AppSection>
			<AppHeader 
				title="Ayuda" 
				showBackButton={true}
			/>
			<AppContainer>
      	<Text>help</Text>
			</AppContainer>
    </AppSection>
  );
}
