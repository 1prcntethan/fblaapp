/**
 * app/community.tsx — Community / Social Screen (STUB)
 * Placeholder — will be built in Phase 4.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_SIZE } from "../constants/theme";

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.center}>
        <Text style={styles.text}>🌐 Community</Text>
        <Text style={styles.sub}>Coming soon — Phase 4</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center:    { flex: 1, alignItems: "center", justifyContent: "center" },
  text:      { fontSize: FONT_SIZE.xl, color: COLORS.textPrimary, fontWeight: "700" },
  sub:       { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 8 },
});