import { AppColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACTION_BUTTONS = [
  {
    id: "ai-assistant",
    title: "AI Assistant",
    subtitle: "Smart guidance and tips",
    icon: "chatbubbles",
    route: "/(tabs)/ai-assistant",
    color: "#2E7DFF",
  },
  {
    id: "appointments",
    title: "My Appointments",
    subtitle: "View and manage bookings",
    icon: "calendar",
    route: "/(tabs)/appointments",
    color: "#FF6B6B",
  },
  {
    id: "doctors",
    title: "Find Doctors",
    subtitle: "Search and book fast",
    icon: "search",
    route: "/(tabs)/doctors",
    color: "#4CAF50",
  },
];

export default function ActionButtons() {
  const router = useRouter();

  const handleButtonPress = (route: string) => {
    router.push(route as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.buttonGrid}>
        {ACTION_BUTTONS.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={styles.actionButton}
            onPress={() => handleButtonPress(button.route)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: button.color + "1F" },
              ]}
            >
              <Ionicons
                name={button.icon as any}
                size={26}
                color={button.color}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.buttonTitle}>{button.title}</Text>
              <Text style={styles.buttonSubtitle}>{button.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={button.color} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primaryColor,
    marginBottom: 12,
  },
  buttonGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.black,
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 13,
    color: AppColors.gray,
  },
});
