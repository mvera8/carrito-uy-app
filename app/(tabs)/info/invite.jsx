import { Text } from "react-native";
import { AppSection } from "../../../components/AppSection";
import { AppHeader } from "../../../components/AppHeader";

export default function Invite() {
  return (
    <AppSection>
			<AppHeader 
				title="Invitar Amigos" 
				showBackButton={true}
			/>

      <Text>Invite</Text>
    </AppSection>
  );
}
