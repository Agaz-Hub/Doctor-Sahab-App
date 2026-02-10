import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AppColors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export interface Doctor {
  _id: string;
  name: string;
  image: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  available: boolean;
  fees: number;
  address: {
    line1?: string;
    line2?: string;
  };
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/doctor/list`);
      const data = await response.json();

      if (data.success) {
        setDoctors(data.doctors.slice(0, 7));
      } else {
        setError(data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleDoctorPress = (doctor: Doctor) => {
    router.push({
      pathname: "/details/[id]",
      params: {
        id: doctor._id,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryColor} />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Doctors</Text>

      {doctors?.map((item) => (
        <Pressable
          onPress={() => handleDoctorPress(item)}
          key={item._id}
          style={styles.doctorCard}
        >
          <View style={styles.doctorInfo}>
            <Image source={{ uri: item?.image }} style={styles.doctorImage} />
            <View>
              <Text style={styles.doctorName}>{item?.name}</Text>
              <Text style={styles.doctorPosition}>{item?.speciality}</Text>
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
  centerContainer: {
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: AppColors.primaryColor,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: AppColors.primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: AppColors.white,
    fontWeight: "600",
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
    backgroundColor: AppColors.primaryLight,
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
