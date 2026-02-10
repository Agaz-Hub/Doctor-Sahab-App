import { AppColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Appointment {
  _id: string;
  docData: {
    name: string;
    speciality: string;
    image: string;
    fees: number;
  };
  slotDate: string;
  slotTime: string;
  cancelled: boolean;
  iscompleted: boolean;
  payment: boolean;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AppointmentsScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/user/appointments`, {
        headers: { token },
      });
      const data = await response.json();
      if (data.success) {
        const loaded: Appointment[] = data.appointments;
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const missedIds: string[] = [];

        // Auto-cancel past scheduled (unpaid/uncompleted) appointments
        loaded.forEach((apt) => {
          if (apt.cancelled || apt.iscompleted || apt.payment) return;
          const [day, month, year] = apt.slotDate.split("_").map(Number);
          const aptDate = new Date(year, month - 1, day);
          aptDate.setHours(0, 0, 0, 0);

          // Cancel if the appointment date is before today (past section)
          if (aptDate < today) {
            missedIds.push(apt._id);
            return;
          }

          // Also cancel same-day appointments whose time has already passed
          const [hours, minutes] = apt.slotTime.split(":").map(Number);
          const aptDateTime = new Date(year, month - 1, day, hours, minutes);
          if (aptDateTime < now) {
            missedIds.push(apt._id);
          }
        });

        // Mark missed ones as cancelled locally
        const processed = loaded.map((apt) =>
          missedIds.includes(apt._id) ? { ...apt, cancelled: true } : apt,
        );
        setAppointments(processed);

        // Fire cancel API for missed appointments in background
        missedIds.forEach((id) => {
          fetch(`${BACKEND_URL}/api/user/cancel-appointment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", token: token! },
            body: JSON.stringify({ appointmentId: id }),
          }).catch(() => {});
        });
      } else {
        Alert.alert("Error", data.message || "Failed to load appointments");
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      Alert.alert("Error", "Failed to load appointments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  // Parse slotDate format "day_month_year" (e.g. "11_2_2026") into a Date
  const parseSlotDate = (slotDate: string): Date => {
    const parts = slotDate.split("_");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  // Parse slotDate + slotTime into a precise Date
  const parseSlotDateTime = (slotDate: string, slotTime: string): Date => {
    const parts = slotDate.split("_");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const [hours, minutes] = slotTime.split(":").map(Number);
    return new Date(year, month, day, hours, minutes);
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "upcoming") {
      return appointments.filter(
        (apt: Appointment) =>
          parseSlotDate(apt.slotDate) >= today &&
          !apt.cancelled &&
          !apt.iscompleted,
      );
    } else if (filter === "past") {
      return appointments
        .filter(
          (apt: Appointment) =>
            parseSlotDate(apt.slotDate) < today ||
            apt.iscompleted ||
            apt.cancelled,
        )
        .sort(
          (a, b) =>
            parseSlotDate(b.slotDate).getTime() -
            parseSlotDate(a.slotDate).getTime(),
        );
    }
    return appointments;
  };

  const getStatus = (apt: Appointment) => {
    if (apt.cancelled) return "cancelled";
    if (apt.iscompleted) return "completed";
    // If date+time has passed and not paid → missed/cancelled
    const now = new Date();
    const aptDateTime = parseSlotDateTime(apt.slotDate, apt.slotTime);
    if (aptDateTime < now && !apt.payment) return "cancelled";
    if (apt.payment) return "confirmed";
    return "scheduled";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return AppColors.primaryColor;
      case "confirmed":
        return "#22C55E";
      case "completed":
        return AppColors.gray;
      case "cancelled":
        return "#EF4444";
      default:
        return AppColors.gray;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "scheduled":
        return "time";
      case "confirmed":
        return "checkmark-circle";
      case "completed":
        return "checkmark-done-circle";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseSlotDate(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePayment = (appointment: Appointment) => {
    Alert.alert(
      "Pay Now",
      `Pay ₹${appointment.docData.fees} for your appointment with ${appointment.docData.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay ₹" + appointment.docData.fees,
          onPress: () => {
            // TODO: Integrate real payment gateway (Razorpay/Stripe)
            Alert.alert(
              "Payment",
              "Payment gateway integration coming soon. For now, please pay at the clinic.",
            );
          },
        },
      ],
    );
  };

  const handleCancel = (appointmentId: string) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            try {
              const response = await fetch(
                `${BACKEND_URL}/api/user/cancel-appointment`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    token,
                  },
                  body: JSON.stringify({ appointmentId }),
                },
              );
              const data = await response.json();
              if (data.success) {
                setAppointments((prev: Appointment[]) =>
                  prev.map((apt: Appointment) =>
                    apt._id === appointmentId
                      ? { ...apt, cancelled: true }
                      : apt,
                  ),
                );
              } else {
                Alert.alert(
                  "Error",
                  data.message || "Failed to cancel appointment",
                );
              }
            } catch (err) {
              Alert.alert("Error", "Network error. Please try again.");
            }
          },
        },
      ],
    );
  };

  const renderAppointment = (appointment: Appointment) => {
    const status = getStatus(appointment);
    const statusColor = getStatusColor(status);

    return (
      <View key={appointment._id} style={styles.appointmentCard}>
        {/* Header */}
        <View style={styles.appointmentHeader}>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{appointment.docData.name}</Text>
            <Text style={styles.specialization}>
              {appointment.docData.speciality}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "18" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(status)}
              size={14}
              color={statusColor}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={AppColors.gray}
            />
            <Text style={styles.detailText}>
              {formatDate(appointment.slotDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={AppColors.gray} />
            <Text style={styles.detailText}>{appointment.slotTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color={AppColors.gray} />
            <Text style={styles.detailText}>₹{appointment.docData.fees}</Text>
          </View>
        </View>

        {/* Payment badge */}
        {status !== "cancelled" && status !== "completed" && (
          <View style={styles.paymentRow}>
            <View
              style={[
                styles.paymentBadge,
                {
                  backgroundColor: appointment.payment
                    ? "#DCFCE7"
                    : AppColors.primaryLight,
                },
              ]}
            >
              <Ionicons
                name={appointment.payment ? "checkmark-circle" : "alert-circle"}
                size={14}
                color={
                  appointment.payment ? "#22C55E" : AppColors.secondaryColor
                }
              />
              <Text
                style={[
                  styles.paymentText,
                  {
                    color: appointment.payment
                      ? "#22C55E"
                      : AppColors.secondaryColor,
                  },
                ]}
              >
                {appointment.payment ? "Paid" : "Payment Pending"}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {status !== "cancelled" && status !== "completed" && (
          <View style={styles.actionButtons}>
            {!appointment.payment && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayment(appointment)}
              >
                <Ionicons
                  name="card-outline"
                  size={16}
                  color={AppColors.white}
                />
                <Text style={styles.payText}>Pay Now</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(appointment._id)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryColor} />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  if (!token || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="log-in-outline"
          size={64}
          color={AppColors.primaryColor}
        />
        <Text style={styles.emptyTitle}>Login Required</Text>
        <Text style={styles.emptySubtitle}>
          Please sign in to view your appointments
        </Text>
        <TouchableOpacity
          style={styles.loginPromptButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Text style={styles.loginPromptText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>
        <Text style={styles.subtitle}>Manage your upcoming & past visits</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["upcoming", "past", "all"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Appointment List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AppColors.primaryColor]}
          />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={AppColors.primaryLight}
            />
            <Text style={styles.emptyTitle}>No appointments found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === "upcoming"
                ? "You have no upcoming appointments"
                : filter === "past"
                  ? "You have no past appointments"
                  : "You haven't booked any appointments yet"}
            </Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {filteredAppointments.map(renderAppointment)}
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// Helper to get an ISO date string offset by N days from today
function getDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
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
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 45,
    paddingBottom: 10,
    backgroundColor: AppColors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.primaryColor,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.gray,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: AppColors.primaryColor,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primaryColor,
  },
  filterTextActive: {
    color: AppColors.white,
  },
  scrollView: {
    flex: 1,
  },
  appointmentsList: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  appointmentCard: {
    backgroundColor: AppColors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 17,
    fontWeight: "bold",
    color: AppColors.black,
    marginBottom: 3,
  },
  specialization: {
    fontSize: 13,
    color: AppColors.primaryColor,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  appointmentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: AppColors.gray,
  },
  paymentRow: {
    marginBottom: 12,
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  payButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: AppColors.primaryColor,
    gap: 6,
  },
  payText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.white,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    gap: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.black,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.gray,
    textAlign: "center",
    marginTop: 6,
  },
  loginPromptButton: {
    marginTop: 20,
    backgroundColor: AppColors.primaryColor,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginPromptText: {
    color: AppColors.white,
    fontWeight: "600",
    fontSize: 15,
  },
});
