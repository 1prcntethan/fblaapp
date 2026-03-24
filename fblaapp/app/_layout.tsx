/**
 * _layout.tsx — Root Layout
 *
 * This is the top-level layout for the entire app.
 * It sets up the bottom tab navigator that persists across all main screens.
 *
 * TAB STRUCTURE (easy to add/remove/reorder tabs here):
 *   0. Home        — Dashboard / news feed
 *   1. Events      — Calendar & competition reminders
 *   2. Resources   — FBLA docs & key links
 *   3. Community   — Social media integration
 *   4. Profile     — Member profile
 *
 * THEMING:
 *   All colors, fonts, and spacing live in constants/theme.ts — change them there
 *   to propagate updates app-wide.
 *
 * DEPENDENCIES (install before running):
 *   npx expo install @react-navigation/bottom-tabs expo-router react-native-safe-area-context
 *   npx expo install @expo/vector-icons
 */

import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS } from "../constants/theme";

// ─── Tab icon helper ───────────────────────────────────────────────────────────
// Keeps the Tabs.Screen declarations clean — just pass the icon name.
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  name,
  focused,
}: {
  name: IoniconsName;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={name}
      size={24}
      color={focused ? COLORS.gold : COLORS.tabIconInactive}
    />
  );
}

// ─── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        // ── Global header style ──────────────────────────────────────────────
        headerStyle: {
          backgroundColor: COLORS.navyDark,
          // Remove the bottom border/shadow on iOS & Android
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontFamily: FONTS.bold,
          fontSize: 18,
          letterSpacing: 0.5,
        },

        // ── Global tab bar style ─────────────────────────────────────────────
        tabBarStyle: {
          backgroundColor: COLORS.navyDark,
          borderTopColor: COLORS.navyLight,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 85 : 65, // Extra height on iOS for home indicator
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.tabIconInactive,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 11,
          letterSpacing: 0.3,
        },
      }}
    >
      {/* ── Tab 0: Home / Dashboard ─────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "FBLA",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />

      {/* ── Tab 1: Events & Calendar ────────────────────────────────────────── */}
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          headerTitle: "Events & Calendar",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "calendar" : "calendar-outline"}
              focused={focused}
            />
          ),
        }}
      />

      {/* ── Tab 2: Resources ────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          headerTitle: "Resources",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "library" : "library-outline"}
              focused={focused}
            />
          ),
        }}
      />

      {/* ── Tab 3: Community / Social ───────────────────────────────────────── */}
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          headerTitle: "Community",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "people" : "people-outline"}
              focused={focused}
            />
          ),
        }}
      />

      {/* ── Tab 4: Member Profile ───────────────────────────────────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}