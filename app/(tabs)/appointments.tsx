import { AppColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  date?: number;
  shiftLabel?: string;
  durationMinutes?: number;
  severityScore?: number;
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

  const loadAppointments = useCallback(
    async (silent = false) => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        if (!silent) setLoading(true);
        const response = await fetch(
          `${BACKEND_URL}/api/users/me/appointments`,
          {
            headers: { token },
          },
        );
        const data = await response.json();
        if (data.success) {
          const loaded: Appointment[] = Array.isArray(data.appointments)
            ? data.appointments
            : [];

          setAppointments(loaded);
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
    },
    [token],
  );

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      loadAppointments(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [token, loadAppointments]);

  // Parse slotDate format "day_month_year" (e.g. "11_2_2026") into a Date
  const parseSlotDate = (slotDate: string): Date | null => {
    if (!slotDate || typeof slotDate !== "string") return null;

    const trimmed = slotDate.trim();

    if (/^\d{1,2}_\d{1,2}_\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split("_").map(Number);
      return new Date(year, month - 1, day);
    }

    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    if (
      /^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmed) ||
      /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)
    ) {
      const [day, month, year] = trimmed.split(/[-/]/).map(Number);
      return new Date(year, month - 1, day);
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const parseSlotTime = (
    slotTime: string,
  ): { hours: number; minutes: number } => {
    if (!slotTime || typeof slotTime !== "string")
      return { hours: 0, minutes: 0 };

    const trimmed = slotTime.trim();
    const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (amPmMatch) {
      let hours = Number(amPmMatch[1]);
      const minutes = Number(amPmMatch[2]);
      const meridiem = amPmMatch[3].toUpperCase();
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
      return { hours, minutes };
    }

    const hhmmMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmmMatch) {
      return { hours: Number(hhmmMatch[1]), minutes: Number(hhmmMatch[2]) };
    }

    return { hours: 0, minutes: 0 };
  };

  const getDurationMinutes = (apt: Appointment): number => {
    const parsed = Number(apt.durationMinutes);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
  };

  // Parse slotDate + slotTime into a precise Date
  const parseSlotDateTime = (
    slotDate: string,
    slotTime: string,
  ): Date | null => {
    const date = parseSlotDate(slotDate);
    if (!date) return null;
    const { hours, minutes } = parseSlotTime(slotTime);
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      0,
      0,
    );
  };

  const getAppointmentWindow = (apt: Appointment) => {
    const start = parseSlotDateTime(apt.slotDate, apt.slotTime);
    if (!start) return { start: null as Date | null, end: null as Date | null };
    const end = new Date(start.getTime() + getDurationMinutes(apt) * 60000);
    return { start, end };
  };

  const getFilteredAppointments = () => {
    const now = new Date();

    const sortNewestFirst = (a: Appointment, b: Appointment) => {
      const aOrderTime =
        a.date || parseSlotDateTime(a.slotDate, a.slotTime)?.getTime() || 0;
      const bOrderTime =
        b.date || parseSlotDateTime(b.slotDate, b.slotTime)?.getTime() || 0;
      return bOrderTime - aOrderTime;
    };

    if (filter === "upcoming") {
      return appointments
        .filter((apt: Appointment) => {
          if (apt.cancelled || apt.iscompleted) return false;
          const { end } = getAppointmentWindow(apt);
          if (!end) return false;
          return end >= now;
        })
        .sort(sortNewestFirst);
    } else if (filter === "past") {
      return appointments
        .filter((apt: Appointment) => {
          if (apt.iscompleted || apt.cancelled) return true;
          const { end } = getAppointmentWindow(apt);
          return Boolean(end && end < now);
        })
        .sort(sortNewestFirst);
    }
    return [...appointments].sort(sortNewestFirst);
  };

  const getStatus = (apt: Appointment) => {
    if (apt.cancelled) return "cancelled";
    if (apt.iscompleted) return "completed";
    const now = new Date();
    const { start, end } = getAppointmentWindow(apt);

    if (!start || !end) return "scheduled";
    if (now > end) return "cancelled";
    if (now >= start && now <= end) return "live";
    if (apt.payment) return "confirmed";
    return "scheduled";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return AppColors.primaryColor;
      case "confirmed":
        return "#22C55E";
      case "live":
        return "#2563EB";
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
      case "live":
        return "play-circle";
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
    if (!date) return "Date unavailable";
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
                `${BACKEND_URL}/api/users/me/appointments/${appointmentId}/cancel`,
                {
                  method: "PATCH",
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
            } catch {
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
    const now = new Date();
    const { start, end } = getAppointmentWindow(appointment);
    const canCancel =
      !appointment.cancelled &&
      !appointment.iscompleted &&
      Boolean(end && now <= end);

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
          {start && end ? (
            <View style={styles.detailRow}>
              <Ionicons name="timer-outline" size={16} color={AppColors.gray} />
              <Text style={styles.detailText}>
                Window:{" "}
                {start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ) : null}
          {appointment.shiftLabel ? (
            <View style={styles.detailRow}>
              <Ionicons
                name="layers-outline"
                size={16}
                color={AppColors.gray}
              />
              <Text style={styles.detailText}>{appointment.shiftLabel}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={AppColors.gray}
            />
            <Text style={styles.detailText}>
              {appointment.durationMinutes || 20} mins consultation
            </Text>
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
              style={[styles.cancelButton, { opacity: canCancel ? 1 : 0.45 }]}
              onPress={() => handleCancel(appointment._id)}
              disabled={!canCancel}
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
