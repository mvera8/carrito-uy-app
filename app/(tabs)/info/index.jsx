// app/(tabs)/info/index.jsx
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { router } from "expo-router";
import { AppIcon } from "../../../components/AppIcon";
import { AppSection } from "../../../components/AppSection";
import useTheme from "../../../hooks/useTheme";


export default function Info() {
  const { isDarkMode, toggleDarkMode, colors } = useTheme();

  return (
    <AppSection>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      {/* --- MENU OPTIONS --- */}
<MenuButton label="Help" icon="chatbubble" onPress={() => router.push("/info/help")} />
<MenuButton label="FAQ" icon="help" onPress={() => router.push("/info/faq")} />
<MenuButton label="Invite Friends" icon="share-social" onPress={() => router.push("/info/invite")} />
<MenuButton label="Terms of Service" icon="document-text" onPress={() => router.push("/info/terms")} />
<MenuButton label="Privacy Policy" icon="shield" onPress={() => router.push("/info/privacy")} />

    </AppSection>
  );
}

/* ------------------------- COMPONENTE REUSABLE ------------------------- */
function MenuButton({ label, icon, onPress }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AppIcon icon={icon} size={20} color={colors.text} />
        <Text style={[styles.rowText, { color: colors.text }]}>{label}</Text>
      </View>


      <AppIcon icon="chevron-forward-outline" variant="transparent" />
    </TouchableOpacity>
  );
}

/* ------------------------------- STYLES ------------------------------- */
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },

  rowText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
