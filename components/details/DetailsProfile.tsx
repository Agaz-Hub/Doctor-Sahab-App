import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { AppColors } from "@/constants/colors";

interface DetailsProfileProps {
  name: string;
  position: string;
  profilePhoto: string;
}

export default function DetailsProfile({
  name,
  position,
  profilePhoto,
}: DetailsProfileProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        <Text style={styles.rating}>
          4.5 <AntDesign name="star" size={15} color={AppColors.white} />
        </Text>
      </View>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.position}>{position}</Text>
        <Text style={styles.experience}>15 + years of experience</Text>
        <Text style={styles.patients}>
          4489+ <Text style={styles.patientsText}> Patients stories</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "flex-start",
    alignContent: "center",
    gap: 20,
    flexDirection: "row",
    marginTop: 30,
  },
  imageContainer: {
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  rating: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.white,
    textAlign: "center",
    marginTop: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.white,
  },
  position: {
    fontSize: 16,
    fontWeight: "500",
    color: "#B1A3D2",
    marginTop: 4,
  },
  experience: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.white,
    marginTop: 4,
  },
  patients: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.white,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  patientsText: {
    fontWeight: "400",
    letterSpacing: 0.5,
  },
});
