import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ScreenMap from "./screens/ScreenMap";
import GymDetailsScreen from "./screens/GymDetailsScreen";
import { ThemeProvider, ThemeContext } from "./ThemeContext";

const Stack = createStackNavigator();

function AppContent() {
  const { isDarkMode, colors } = useContext(ThemeContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Map"
          component={ScreenMap}
          options={{
            title: "GymFinder",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: colors.text,
            },
          }}
        />
        <Stack.Screen
          name="GymDetails"
          component={GymDetailsScreen}
          options={{
            title: "GymFinder",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: colors.text,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
