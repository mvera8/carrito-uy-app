import { View } from "react-native";
import { ProductSearch } from "../components/ProductSearch";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SupermarketList } from "../components/SupermarketList";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: insets.bottom }}>
      <SupermarketList />
      <ProductSearch navigation={navigation} />
    </View>
  );
}
