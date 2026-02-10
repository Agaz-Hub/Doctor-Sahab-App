import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { AppColors } from "@/constants/colors";

interface DetailsProfileProps {
  name: string;
  position: string;
  profilePhoto: string;
  experience?: string;
  degree?: string;
}

export default function DetailsProfile({
  name,
  position,
  profilePhoto,
  experience,
  degree,
}: DetailsProfileProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.imageBackground}>
          <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        </View>
        <Text style={styles.rating}>
          4.5 <AntDesign name="star" size={15} color={AppColors.white} />
        </Text>
      </View>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.position}>{position}</Text>
        {degree && <Text style={styles.degree}>{degree}</Text>}
        <Text style={styles.experience}>
          {experience || "N/A"} of experience
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
  imageBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
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
  degree: {
    fontSize: 14,
    fontWeight: "500",
    color: "#B1A3D2",
    marginTop: 2,
  },
  experience: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.white,
    marginTop: 4,
  },
});
