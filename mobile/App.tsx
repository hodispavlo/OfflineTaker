import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AIProfileProvider } from "./src/context/AIProfileContext";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { NoteDetailScreen } from "./src/screens/NoteDetailScreen";
import { RecorderScreen } from "./src/screens/RecorderScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { RootStackParamList } from "./src/types";
import { colors } from "./src/theme/colors";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AIProfileProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerShadowVisible: false,
              headerTitleStyle: { color: colors.text, fontWeight: "700" },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "OfflineTaker" }} />
            <Stack.Screen name="Recorder" component={RecorderScreen} options={{ title: "Record" }} />
            <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: "Meeting note" }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AIProfileProvider>
    </GestureHandlerRootView>
  );
}
