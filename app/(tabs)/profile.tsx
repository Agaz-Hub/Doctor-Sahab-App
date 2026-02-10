import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { AppColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const userName = "User";
  const userEmail = "user@example.com";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          // TODO: implement sign out once auth is added
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 1,
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your personal information",
    },
    {
      id: 2,
      icon: "document-text-outline",
      title: "Medical Records",
      subtitle: "View your health history",
    },
    {
      id: 3,
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage notification preferences",
    },
    {
      id: 4,
      icon: "shield-checkmark-outline",
      title: "Privacy & Security",
      subtitle: "Control your data and privacy",
    },
    {
      id: 5,
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help or contact support",
    },
    {
      id: 6,
      icon: "information-circle-outline",
      title: "About",
      subtitle: "App version and information",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Patient</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Appointments</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Prescriptions</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={AppColors.primaryColor}
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons
          name="log-out-outline"
          size={20}
          color={AppColors.secondaryColor}
        />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  header: {
    backgroundColor: AppColors.white,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.black,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: AppColors.gray,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: AppColors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primaryColor,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.primaryColor,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: AppColors.primaryLighter,
  },
  menuContainer: {
    backgroundColor: AppColors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.black,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: AppColors.gray,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.secondaryColor,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: AppColors.gray,
    marginTop: 20,
  },
});
