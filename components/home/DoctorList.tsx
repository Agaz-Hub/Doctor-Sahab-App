import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { AppColors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export interface Doctor {
  id: number;
  name: string;
  position: string;
  profilePhoto: string;
}

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. jane cooper",
    position: "Pediatrician",
    profilePhoto:
      "https://www.shutterstock.com/image-photo/healthcare-medical-staff-concept-portrait-600nw-2281024823.jpg",
  },
  {
    id: 2,
    name: "Lily Taylor",
    position: "Ophthalmologist",
    profilePhoto:
      "https://www.shutterstock.com/image-photo/profile-photo-attractive-family-doc-600nw-1724693776.jpg",
  },
  {
    id: 3,
    name: "Max Parker",
    position: "Endocrinologist",
    profilePhoto:
      "https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg",
  },
  {
    id: 4,
    name: "John Doe",
    position: "Pediatrician",
    profilePhoto:
      "https://www.shutterstock.com/image-photo/healthcare-medical-staff-concept-portrait-600nw-2281024823.jpg",
  },
  {
    id: 5,
    name: "John Doe",
    position: "Pediatrician",
    profilePhoto:
      "https://www.shutterstock.com/image-photo/healthcare-medical-staff-concept-portrait-600nw-2281024823.jpg",
  },
];

export default function DoctorList() {
  const handleDoctorPress = (doctor: Doctor) => {
    router.push({
      pathname: "/details/[id]",
      params: {
        id: doctor.id.toString(),
        name: doctor.name,
        position: doctor.position,
        profilePhoto: doctor.profilePhoto,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Doctors</Text>

      {doctors?.map((item) => (
        <Pressable
          onPress={() => handleDoctorPress(item)}
          key={item.id}
          style={styles.doctorCard}
        >
          <View style={styles.doctorInfo}>
            <Image
              source={{ uri: item?.profilePhoto }}
              style={styles.doctorImage}
            />
            <View>
              <Text style={styles.doctorName}>{item?.name}</Text>
              <Text style={styles.doctorPosition}>{item?.position}</Text>
            </View>
          </View>
          <View>
            <TouchableOpacity style={styles.callButton}>
              <Feather
                name="phone-call"
                size={24}
                color={AppColors.primaryColor}
              />
            </TouchableOpacity>
          </View>
        </Pressable>
      ))}
      <View style={styles.bottomSpacing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  title: {
    color: AppColors.primaryColor,
    fontSize: 20,
    fontWeight: "700",
  },
  doctorCard: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: AppColors.white,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { height: 0.2, width: 0.2 },
    elevation: 1,
    borderRadius: 20,
  },
  doctorInfo: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  doctorImage: {
    width: 55,
    height: 55,
    borderRadius: 15,
  },
  doctorName: {
    fontWeight: "bold",
    color: AppColors.black,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  doctorPosition: {
    fontWeight: "400",
    color: "gray",
    fontSize: 14,
    marginTop: 4,
  },
  callButton: {
    padding: 12,
    borderRadius: 15,
    backgroundColor: AppColors.primaryLight,
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpacing: {
    paddingBottom: 100,
  },
});
