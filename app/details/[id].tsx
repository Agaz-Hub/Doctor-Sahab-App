import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import DetailsHeader from "@/components/details/DetailsHeader";
import { AppColors } from "@/constants/colors";
import DetailsProfile from "@/components/details/DetailsProfile";
import DetailsContent from "@/components/details/DetailsContent";

export default function DoctorDetails() {
  const { id, name, position, profilePhoto } = useLocalSearchParams<{
    id: string;
    name: string;
    position: string;
    profilePhoto: string;
  }>();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={AppColors.primaryColor}
      />
      <View style={styles.headerSection}>
        <DetailsHeader />
        <DetailsProfile
          name={name || ""}
          position={position || ""}
          profilePhoto={profilePhoto || ""}
        />
      </View>

      <View style={styles.contentSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DetailsContent />
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Under Construction 😎",
              "We are under construction and please wait...",
            );
          }}
          style={styles.bookButton}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  headerSection: {
    width: "100%",
    height: Platform.OS === "ios" ? 320 : 280,
    backgroundColor: AppColors.primaryColor,
    paddingHorizontal: 30,
  },
  contentSection: {
    flex: 1,
    backgroundColor: AppColors.white,
    marginTop: -40,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 30,
  },
  bottomSpacing: {
    paddingBottom: 200,
  },
  bookButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
  },
  bookButton: {
    borderRadius: 20,
    backgroundColor: AppColors.primaryColor,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  bookButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
