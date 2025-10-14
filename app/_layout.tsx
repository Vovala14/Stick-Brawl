import { Stack } from 'expo-router';
import { GameProvider } from '../context/GameContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <GameProvider>
      <StatusBar style="light" hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="customize" />
        <Stack.Screen name="levels" />
        <Stack.Screen name="weapon-select" />
        <Stack.Screen name="game" />
        <Stack.Screen name="results" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="credits" />
      </Stack>
    </GameProvider>
  );
}
