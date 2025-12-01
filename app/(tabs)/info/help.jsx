// app/(tabs)/info/help.jsx
import { Text } from "react-native";
import { AppSection, AppHeader, AppContainer } from "../../../components";

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
