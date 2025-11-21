// app/(tabs)/info/help.jsx
import { Text } from "react-native";
import { AppSection } from "../../../components/AppSection";
import { AppHeader } from "../../../components/AppHeader";

export default function Help() {
  return (
    <AppSection>
			<AppHeader 
				title="Ayuda" 
				showBackButton={true}
			/>

      <Text>help</Text>
    </AppSection>
  );
}
