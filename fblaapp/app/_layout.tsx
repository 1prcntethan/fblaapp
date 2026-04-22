import { Stack } from "expo-router";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import { useContext } from "react";

function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  console.log("User: ", user);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}