import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DetailsHeader from "@/components/details/DetailsHeader";
import { AppColors } from "@/constants/colors";
import DetailsProfile from "@/components/details/DetailsProfile";
import DetailsContent from "@/components/details/DetailsContent";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Doctor {
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
  date: number;
  slots_booked: Record<string, string[]>;
}

export default function DoctorDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/doctor/list`);
      const data = await response.json();

      if (data.success) {
        const foundDoctor = data.doctors.find((doc: Doctor) => doc._id === id);
        if (foundDoctor) {
          setDoctor(foundDoctor);
        } else {
          setError("Doctor not found");
        }
      } else {
        setError(data.message || "Failed to fetch doctor details");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error fetching doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const bookAppointment = async () => {
    if (!doctor) return;

    if (!doctor.available) {
      Alert.alert(
        "Not Available",
        "This doctor is currently not available for appointments."
      );
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert(
        "Select Slot",
        "Please select both date and time for your appointment."
      );
      return;
    }

    try {
      setIsBooking(true);
      
      // Get user token from AsyncStorage
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(
          "Login Required",
          "Please login to book an appointment.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Login", onPress: () => router.push("/login" as any) }
          ]
        );
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/user/book-appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          docId: doctor._id,
          slotDate: selectedDate,
          slotTime: selectedTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Appointment Booked!",
          `Your appointment with Dr. ${doctor.name} has been booked for ${selectedDate} at ${selectedTime}.`,
          [
            {
              text: "View Appointments",
              onPress: () => router.push("/appointments" as any),
            },
            { text: "OK" },
          ]
        );
        // Refresh doctor data to get updated slots
        fetchDoctorDetails();
        setSelectedTime(null);
      } else {
        Alert.alert("Booking Failed", data.message || "Failed to book appointment. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      Alert.alert("Error", "Network error. Please check your connection and try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryColor} />
        <Text style={styles.loadingText}>Loading doctor details...</Text>
      </View>
    );
  }

  if (error || !doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error || "Doctor not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchDoctorDetails}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getButtonText = () => {
    if (isBooking) return "Booking...";
    if (!doctor?.available) return "Not Available";
    if (!selectedDate || !selectedTime) return "Select Date & Time";
    return `Book for Rs. ${doctor.fees}`;
  };

  const isButtonDisabled = !doctor?.available || isBooking || !selectedDate || !selectedTime;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={AppColors.primaryColor}
      />
      <View style={styles.headerSection}>
        <DetailsHeader />
        <DetailsProfile
          name={doctor.name}
          position={doctor.speciality}
          profilePhoto={doctor.image}
          experience={doctor.experience}
          degree={doctor.degree}
        />
      </View>

      <View style={styles.contentSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DetailsContent
            about={doctor.about}
            fees={doctor.fees}
            available={doctor.available}
            slotsBooked={doctor.slots_booked}
            address={doctor.address}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
          />
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          onPress={bookAppointment}
          style={[
            styles.bookButton,
            isButtonDisabled && styles.bookButtonDisabled,
          ]}
          disabled={isButtonDisabled}
        >
          {isBooking ? (
            <ActivityIndicator size="small" color={AppColors.white} />
          ) : (
            <Text style={styles.bookButtonText}>{getButtonText()}</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.white,
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
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
