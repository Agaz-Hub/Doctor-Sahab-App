import { AppColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
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
  isCompleted: boolean;
  payment: boolean;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call once user auth is in place
      // const response = await fetch(`${BACKEND_URL}/api/user/appointments`, {
      //   headers: { token: userToken },
      // });
      // const data = await response.json();
      // if (data.success) setAppointments(data.appointments);

      // Mock data for now
      const mockAppointments: Appointment[] = [
        {
          _id: "1",
          docData: {
            name: "Dr. Sarah Johnson",
            speciality: "Cardiologist",
            image: "",
            fees: 500,
          },
          slotDate: getDateString(1),
          slotTime: "10:00 AM",
          cancelled: false,
          isCompleted: false,
          payment: true,
        },
        {
          _id: "2",
          docData: {
            name: "Dr. Michael Chen",
            speciality: "Neurologist",
            image: "",
            fees: 700,
          },
          slotDate: getDateString(2),
          slotTime: "2:30 PM",
          cancelled: false,
          isCompleted: false,
          payment: false,
        },
        {
          _id: "3",
          docData: {
            name: "Dr. Emily Davis",
            speciality: "General Physician",
            image: "",
            fees: 300,
          },
          slotDate: getDateString(-1),
          slotTime: "11:00 AM",
          cancelled: false,
          isCompleted: true,
          payment: true,
        },
        {
          _id: "4",
          docData: {
            name: "Dr. Rajesh Kumar",
            speciality: "Dermatologist",
            image: "",
            fees: 400,
          },
          slotDate: getDateString(-3),
          slotTime: "4:00 PM",
          cancelled: true,
          isCompleted: false,
          payment: false,
        },
      ];

      setAppointments(mockAppointments);
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

  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split("T")[0];

    if (filter === "upcoming") {
      return appointments.filter(
        (apt: Appointment) =>
          apt.slotDate >= today && !apt.cancelled && !apt.isCompleted,
      );
    } else if (filter === "past") {
      return appointments.filter(
        (apt: Appointment) =>
          apt.slotDate < today || apt.isCompleted || apt.cancelled,
      );
    }
    return appointments;
  };

  const getStatus = (apt: Appointment) => {
    if (apt.cancelled) return "cancelled";
    if (apt.isCompleted) return "completed";
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          onPress: () => {
            setAppointments((prev: Appointment[]) =>
              prev.map((apt: Appointment) =>
                apt._id === appointmentId ? { ...apt, cancelled: true } : apt,
              ),
            );
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
        {!appointment.cancelled && !appointment.isCompleted && (
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
        {!appointment.cancelled && !appointment.isCompleted && (
          <View style={styles.actionButtons}>
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
});
