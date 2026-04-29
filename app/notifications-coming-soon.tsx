import { AppColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationsComingSoonScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons
            name="notifications-outline"
            size={44}
            color={AppColors.primaryColor}
          />
        </View>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Coming soon. Appointment reminders, booking updates, and call alerts
          will appear here.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What to expect</Text>
          <Text style={styles.cardItem}>• Upcoming appointment reminders</Text>
          <Text style={styles.cardItem}>
            • Shift and booking status changes
          </Text>
          <Text style={styles.cardItem}>
            • Important health and account notices
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.primaryColor,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.gray,
    textAlign: "center",
  },
  card: {
    marginTop: 6,
    width: "100%",
    backgroundColor: AppColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primaryColor,
    marginBottom: 8,
  },
  cardItem: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4B5563",
  },
  button: {
    marginTop: 10,
    backgroundColor: AppColors.primaryColor,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: AppColors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});
