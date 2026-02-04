import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { AppColors } from "@/constants/colors";

interface DoctorImageProps {
  uri: string;
}

const DoctorImage: React.FC<DoctorImageProps> = ({ uri }) => {
  return <Image source={{ uri }} style={styles.doctorImage} />;
};

export default function HeadLine() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book appointment with</Text>
      <Text style={styles.title}>expert surgeon</Text>

      <View style={styles.doctorImagesRow}>
        <Image
          source={{
            uri: "https://www.shutterstock.com/image-photo/healthcare-medical-staff-concept-portrait-600nw-2281024823.jpg",
          }}
          style={styles.firstDoctorImage}
        />
        <DoctorImage uri="https://t3.ftcdn.net/jpg/02/60/04/08/360_F_260040863_fYxB1SnrzgJ9AOkcT0hoe7IEFtsPiHAD.jpg" />
        <DoctorImage uri="https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg" />
        <DoctorImage uri="https://www.shutterstock.com/image-photo/young-asian-female-doctor-standing-600nw-2138546201.jpg" />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.doctorsButton}>
          <Text style={styles.doctorsButtonText}>+454 Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    backgroundColor: AppColors.primaryColor,
    padding: 20,
    borderRadius: 30,
  },
  title: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  doctorImagesRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  firstDoctorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  doctorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: AppColors.white,
    marginLeft: -10,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  doctorsButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#6D55B2",
    borderRadius: 20,
  },
  doctorsButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  bookNowButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: AppColors.white,
    borderRadius: 15,
  },
  bookNowButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.primaryColor,
  },
});
