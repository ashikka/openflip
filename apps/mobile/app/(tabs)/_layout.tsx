/**
 * Tab layout — the main navigation tabs.
 */

import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopColor: "#1a1a1a",
        },
        tabBarActiveTintColor: "#ff6b35",
        tabBarInactiveTintColor: "#666",
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#ff6b35",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Devices",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="BLE" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: "Agent",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="AI" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Identify",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="CAM" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: "Flipper",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="FZ" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
