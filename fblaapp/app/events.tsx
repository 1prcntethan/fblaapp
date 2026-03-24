/**
 * app/events.tsx — Events & Calendar Screen (STUB)
 *
 * This is a placeholder screen. It will be fully built out in the next phase.
 * The tab navigator references this file — do not delete it.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, FONT_SIZE } from "../constants/theme";

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.center}>
        <Text style={styles.text}>📅 Events & Calendar</Text>
        <Text style={styles.sub}>Coming soon — Phase 2</Text>
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