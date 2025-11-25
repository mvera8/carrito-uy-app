
import { useState } from 'react';
import { Text } from 'react-native'
import { AppSection } from '../../components/AppSection';
import { AppPublicidad } from '../../components/AppPublicidad';
import { TextSmall } from '../../components/TextSmall';
import { AppContainer } from '../../components/AppContainer';

export default function Lists() {
	const [lists, setLists] = useState([]);

	if (lists.length === 0) {
		return (
			<AppSection>
				<AppContainer>
					<AppPublicidad />
					<TextSmall>No se encontró ninguna lista.</TextSmall>
				</AppContainer>
      </AppSection>
		);
	}

	return (
		<AppSection>
			<AppContainer>
				<Text>Listas</Text>
			</AppContainer>
		</AppSection>
	)
}