import { Text } from "react-native";
import { AppSection, AppHeader } from "../../../components";

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
