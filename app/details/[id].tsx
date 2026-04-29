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
  Linking,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
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
  shifts?: Array<{
    id: string;
    label: string;
    startTime: string;
    endTime: string;
  }>;
}

interface BookingSuccess {
  date: string;
  time: string;
  durationMinutes: number;
  shiftLabel: string;
  queuePosition?: number;
}

type ShiftAvailability = { isFull?: boolean; remainingMinutes?: number };

const UPCOMING_DAYS_COUNT = 7;

const buildUpcomingDateKeys = (daysCount = UPCOMING_DAYS_COUNT): string[] => {
  const today = new Date();
  const dates: string[] = [];

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(
      `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`,
    );
  }

  return dates;
};

const parseDateKey = (dateKey: string | null | undefined): Date | null => {
  if (!dateKey) return null;
  const [day, month, year] = dateKey.split("_").map(Number);
  if (!day || !month || !year) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseHHMMToMinutes = (time: string | null | undefined): number | null => {
  if (!time || !time.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const isPastDateKey = (dateKey: string | null | undefined): boolean => {
  const date = parseDateKey(dateKey);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

const isTodayDateKey = (dateKey: string | null | undefined): boolean => {
  const date = parseDateKey(dateKey);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export default function DoctorDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [shiftAvailability, setShiftAvailability] = useState<
    Record<string, ShiftAvailability>
  >({});
  const [dateShiftAvailability, setDateShiftAvailability] = useState<
    Record<string, Record<string, ShiftAvailability>>
  >({});
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingSuccess | null>(
    null,
  );
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  useEffect(() => {
    if (!doctor?._id) return;
    prefetchUpcomingShiftAvailability();
  }, [doctor?._id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/doctors`);
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
    setSelectedShift(null);

    const cached = dateShiftAvailability[date];
    if (cached && Object.keys(cached).length > 0) {
      setShiftAvailability(cached);
      return;
    }

    fetchShiftAvailability(date, true);
  };

  const mapShiftAvailabilityFromResponse = (data: any) => {
    const mapped: Record<string, ShiftAvailability> = {};
    if (data?.success && Array.isArray(data.shifts)) {
      data.shifts.forEach((shift: any) => {
        mapped[shift.id] = {
          isFull: shift.isFull,
          remainingMinutes: shift.remainingMinutes,
        };
      });
    }
    return mapped;
  };

  const fetchShiftAvailability = async (
    date: string,
    updateSelectedShiftState = true,
  ): Promise<Record<string, ShiftAvailability>> => {
    if (!doctor?._id) return {};

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/doctors/${doctor._id}/slots?date=${date}`,
      );
      const data = await response.json();
      const mapped = mapShiftAvailabilityFromResponse(data);

      setDateShiftAvailability((prev) => ({
        ...prev,
        [date]: mapped,
      }));

      if (updateSelectedShiftState) {
        setShiftAvailability(mapped);
      }

      return mapped;
    } catch (err) {
      console.error("Failed to fetch shifts:", err);
      if (updateSelectedShiftState) {
        setShiftAvailability({});
      }
      return {};
    }
  };

  const prefetchUpcomingShiftAvailability = async () => {
    if (!doctor?._id) return;

    const upcomingDates = buildUpcomingDateKeys();
    const results = await Promise.all(
      upcomingDates.map(async (date) => {
        const mapped = await fetchShiftAvailability(date, false);
        return { date, mapped };
      }),
    );

    const merged: Record<string, Record<string, ShiftAvailability>> = {};
    results.forEach(({ date, mapped }) => {
      merged[date] = mapped;
    });

    setDateShiftAvailability((prev) => ({ ...prev, ...merged }));

    if (selectedDate && merged[selectedDate]) {
      setShiftAvailability(merged[selectedDate]);
    }
  };

  const handleTimeSelect = (shiftId: string) => {
    setSelectedShift(shiftId);
  };

  const openBookingForm = async () => {
    if (!doctor) return;

    if (!doctor.available) {
      Alert.alert(
        "Not Available",
        "This doctor is currently not available for appointments.",
      );
      return;
    }

    if (!selectedDate || !selectedShift) {
      Alert.alert("Select Slot", "Please select both date and shift.");
      return;
    }

    if (shiftAvailability[selectedShift]?.isFull) {
      Alert.alert(
        "Shift Full",
        "This shift is already full. Please select another shift.",
      );
      return;
    }

    if (!token) {
      Alert.alert("Login Required", "Please login to book an appointment.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          onPress: () => router.push("/(tabs)/profile" as any),
        },
      ]);
      return;
    }

    setPatientName((prev) => prev || user?.name || "");
    setPatientAge((prev) => prev || "");
    setSymptoms((prev) => prev || "");
    setShowIntakeModal(true);
  };

  const bookAppointment = async () => {
    if (!doctor) return;
    if (!token) return;

    if (!selectedDate || !selectedShift) {
      Alert.alert("Select Slot", "Please select date and shift first.");
      return;
    }

    const ageNumber = Number(patientAge);
    if (
      !patientName.trim() ||
      !patientAge.trim() ||
      Number.isNaN(ageNumber) ||
      ageNumber <= 0 ||
      !symptoms.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please enter valid name, age and symptoms.",
      );
      return;
    }

    try {
      setIsBooking(true);

      const response = await fetch(`${BACKEND_URL}/api/users/me/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          docId: doctor._id,
          slotDate: selectedDate,
          shiftId: selectedShift,
          patientName: patientName.trim(),
          patientAge: ageNumber,
          symptoms: symptoms.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowIntakeModal(false);
        const selectedShiftLabel =
          doctor.shifts?.find((shift) => shift.id === selectedShift)?.label ||
          "Selected Shift";

        setBookingSuccess({
          date: selectedDate,
          time: data.appointmentTime || data.appointment?.slotTime || "TBD",
          durationMinutes:
            data.durationMinutes || data.appointment?.durationMinutes || 20,
          shiftLabel: data.shiftLabel || selectedShiftLabel,
          queuePosition: data.queuePosition || data.appointment?.queuePosition,
        });

        // Refresh doctor data to get updated slots
        fetchDoctorDetails();
        fetchShiftAvailability(selectedDate);
        prefetchUpcomingShiftAvailability();
        setSelectedShift(null);
        setPatientName("");
        setPatientAge("");
        setSymptoms("");

        if (data.emergencyDetected) {
          setShowEmergencyModal(true);
        }
      } else {
        Alert.alert(
          "Booking Failed",
          data.message || "Failed to book appointment. Please try again.",
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again.",
      );
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
    if (!selectedDate || !selectedShift) return "Select Date & Shift";
    return `Continue Booking (Rs. ${doctor.fees})`;
  };

  const isButtonDisabled =
    !doctor?.available ||
    isBooking ||
    !selectedDate ||
    !selectedShift ||
    (() => {
      if (!selectedDate || !selectedShift) return true;
      if (isPastDateKey(selectedDate)) return true;

      const selectedShiftObj = doctor?.shifts?.find(
        (shift) => shift.id === selectedShift,
      );

      if (selectedShiftObj && isTodayDateKey(selectedDate)) {
        const endMinutes = parseHHMMToMinutes(selectedShiftObj.endTime);
        if (endMinutes !== null) {
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          if (endMinutes <= nowMinutes) return true;
        }
      }

      return shiftAvailability[selectedShift]?.isFull === true;
    })();

  const formatSlotDate = (slotDate: string) => {
    const [day, month, year] = slotDate.split("_").map(Number);
    const parsed = new Date(year, month - 1, day);

    if (Number.isNaN(parsed.getTime())) return slotDate;

    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDoctorName = (name: string) => {
    const rawName = (name || "").trim();
    const nameWithoutPrefix = rawName.replace(/^dr\.?\s*/i, "");
    return `Dr. ${nameWithoutPrefix}`;
  };

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
            address={doctor.address}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            shifts={doctor.shifts || []}
            shiftAvailability={shiftAvailability}
            dateShiftAvailability={dateShiftAvailability}
          />
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <Modal
        visible={showIntakeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIntakeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Patient Details</Text>
            <TextInput
              value={patientName}
              onChangeText={setPatientName}
              placeholder="Patient name"
              style={styles.input}
            />
            <TextInput
              value={patientAge}
              onChangeText={setPatientAge}
              placeholder="Age"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Symptoms"
              multiline
              style={[styles.input, styles.symptomsInput]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowIntakeModal(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitModalButton}
                onPress={bookAppointment}
              >
                <Text style={styles.submitModalText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!bookingSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setBookingSuccess(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark" size={26} color={AppColors.white} />
            </View>

            <Text style={styles.successTitle}>Appointment Confirmed</Text>
            <Text style={styles.successSubtitle}>
              Your consultation has been booked successfully.
            </Text>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doctor</Text>
                <Text style={styles.summaryValue}>
                  {formatDoctorName(doctor.name)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>
                  {bookingSuccess ? formatSlotDate(bookingSuccess.date) : "-"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>
                  {bookingSuccess?.time || "-"}
                </Text>
              </View>
              {bookingSuccess?.queuePosition ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Queue Number</Text>
                  <Text style={styles.summaryValue}>
                    #{bookingSuccess.queuePosition}
                  </Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shift</Text>
                <Text style={styles.summaryValue}>
                  {bookingSuccess?.shiftLabel || "-"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>
                  {bookingSuccess?.durationMinutes || 0} mins
                </Text>
              </View>
            </View>

            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.successSecondaryButton}
                onPress={() => setBookingSuccess(null)}
              >
                <Text style={styles.successSecondaryText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successPrimaryButton}
                onPress={() => {
                  setBookingSuccess(null);
                  router.push("/appointments" as any);
                }}
              >
                <Text style={styles.successPrimaryText}>View Appointments</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyIconWrap}>
              <Ionicons name="warning" size={26} color={AppColors.white} />
            </View>

            <Text style={styles.emergencyTitle}>Emergency Risk Detected</Text>
            <Text style={styles.emergencySubtitle}>
              Your symptoms may indicate an emergency condition. Please seek
              immediate medical care.
            </Text>

            <View style={styles.emergencyActions}>
              <TouchableOpacity
                style={styles.emergencySecondaryButton}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={styles.emergencySecondaryText}>I Understand</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emergencyPrimaryButton}
                onPress={async () => {
                  try {
                    await Linking.openURL("tel:108");
                  } catch {
                    Alert.alert(
                      "Call Failed",
                      "Unable to open dialer. Please call emergency services manually.",
                    );
                  }
                }}
              >
                <Text style={styles.emergencyPrimaryText}>Call 108</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          onPress={openBookingForm}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.primaryColor,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  symptomsInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    gap: 10,
  },
  cancelModalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FEE2E2",
  },
  cancelModalText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  submitModalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: AppColors.primaryColor,
  },
  submitModalText: {
    color: AppColors.white,
    fontWeight: "600",
  },
  successCard: {
    backgroundColor: AppColors.white,
    borderRadius: 18,
    padding: 18,
  },
  successIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#10B981",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primaryColor,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  summaryBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  summaryValue: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  successActions: {
    flexDirection: "row",
    gap: 10,
  },
  successSecondaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
  },
  successSecondaryText: {
    color: AppColors.primaryColor,
    fontWeight: "600",
  },
  successPrimaryButton: {
    flex: 1.5,
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: AppColors.primaryColor,
    alignItems: "center",
  },
  successPrimaryText: {
    color: AppColors.white,
    fontWeight: "700",
  },
  emergencyCard: {
    backgroundColor: AppColors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  emergencyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EF4444",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#B91C1C",
    textAlign: "center",
  },
  emergencySubtitle: {
    fontSize: 14,
    color: "#7F1D1D",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 21,
  },
  emergencyActions: {
    flexDirection: "row",
    gap: 10,
  },
  emergencySecondaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  emergencySecondaryText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
  emergencyPrimaryButton: {
    flex: 1.2,
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  emergencyPrimaryText: {
    color: AppColors.white,
    fontWeight: "700",
  },
});
