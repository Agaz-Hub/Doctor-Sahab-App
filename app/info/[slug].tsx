import { AppColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type InfoContent = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  subtitle: string;
  sections: Array<{ heading: string; body: string }>;
};

const INFO_MAP: Record<string, InfoContent> = {
  "privacy-security": {
    title: "Privacy & Security",
    icon: "shield-checkmark-outline",
    accent: "#E8F2FF",
    subtitle: "How we protect your account and health data.",
    sections: [
      {
        heading: "Data Encryption",
        body: "Profile and appointment data are transmitted over secure channels to reduce interception risk.",
      },
      {
        heading: "Account Safety Tips",
        body: "Use a strong password, avoid sharing login credentials, and sign out from shared devices.",
      },
      {
        heading: "Profile Controls",
        body: "You can review and update key profile details from the Edit Profile page at any time.",
      },
      {
        heading: "Emergency Guidance",
        body: "If the app flags emergency symptoms, seek immediate medical care and contact emergency services.",
      },
    ],
  },
  "help-support": {
    title: "Help & Support",
    icon: "help-circle-outline",
    accent: "#FFF4EA",
    subtitle: "Need help with booking, account, or app behavior?",
    sections: [
      {
        heading: "Booking Help",
        body: "If booking fails, re-check date, shift availability, and your network connection, then try again.",
      },
      {
        heading: "Support Channels",
        body: "Email: support@doctorsahab.app | Helpline: +91-90000-00000 (Mon-Sat, 9:00 AM - 6:00 PM)",
      },
      {
        heading: "Expected Response",
        body: "Most issues are acknowledged within 24 business hours.",
      },
      {
        heading: "Report a Bug",
        body: "Share what happened, what you expected, and your device details for faster resolution.",
      },
    ],
  },
  about: {
    title: "About",
    icon: "information-circle-outline",
    accent: "#EEF8F1",
    subtitle: "Built to simplify trusted healthcare access.",
    sections: [
      {
        heading: "What Is Doctor Sahab",
        body: "Doctor Sahab helps patients discover verified doctors, book shift-based consultations, and manage appointments.",
      },
      {
        heading: "Core Features",
        body: "Doctor discovery, smart shift scheduling, appointment tracking, profile management, and AI-assisted triage workflows.",
      },
      {
        heading: "Version",
        body: "Current app version: 1.0.0",
      },
      {
        heading: "Mission",
        body: "To make healthcare access faster, clearer, and more dependable for every patient.",
      },
    ],
  },
};

export default function InfoScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const key = Array.isArray(slug) ? slug[0] : slug;
  const content = (key && INFO_MAP[key]) || {
    title: "Information",
    icon: "information-circle-outline" as keyof typeof Ionicons.glyphMap,
    accent: "#F5F5F5",
    subtitle: "Details are being prepared.",
    sections: [
      {
        heading: "Coming Soon",
        body: "This section will be available in a future update.",
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={AppColors.primaryColor}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{content.title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: content.accent }]}>
          <View style={styles.heroIconWrap}>
            <Ionicons
              name={content.icon}
              size={32}
              color={AppColors.primaryColor}
            />
          </View>
          <Text style={styles.heroTitle}>{content.title}</Text>
          <Text style={styles.heroSubtitle}>{content.subtitle}</Text>
        </View>

        {content.sections.map(
          (section: { heading: string; body: string }, idx: number) => (
            <View key={`${section.heading}-${idx}`} style={styles.card}>
              <Text style={styles.cardTitle}>{section.heading}</Text>
              <Text style={styles.cardBody}>{section.body}</Text>
            </View>
          ),
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryLighter,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primaryColor,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
    gap: 12,
  },
  heroCard: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EAF3",
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.primaryColor,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    color: "#4B5563",
    lineHeight: 19,
  },
  card: {
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
    borderRadius: 12,
    padding: 12,
    backgroundColor: AppColors.white,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.black,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
  },
});
