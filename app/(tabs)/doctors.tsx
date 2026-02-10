import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { AppColors } from "@/constants/colors";
import Search from "@/components/home/Search";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const SPECIALITIES = [
  "All",
  "General Physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
  "Cardiologist",
];

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
}

export default function DoctorsScreen() {
  const { speciality } = useLocalSearchParams<{ speciality?: string }>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(speciality || "All");

  // Sync with incoming param when navigating from home
  useEffect(() => {
    if (speciality) {
      setActiveFilter(speciality);
    }
  }, [speciality]);

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
        setDoctors(data.doctors);
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

  const filteredDoctors = useMemo(() => {
    if (activeFilter === "All") return doctors;
    return doctors.filter(
      (d: Doctor) => d.speciality.toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [doctors, activeFilter]);

  const handleDoctorPress = (doctor: Doctor) => {
    router.push({
      pathname: "/details/[id]",
      params: { id: doctor._id },
    });
  };

  const renderFilterChip = (item: string) => {
    const isActive = activeFilter === item;
    return (
      <TouchableOpacity
        key={item}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setActiveFilter(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <Pressable
      onPress={() => handleDoctorPress(item)}
      style={styles.doctorCard}
    >
      <Image source={{ uri: item.image }} style={styles.doctorImage} />
      <View style={styles.doctorDetails}>
        <View style={styles.availabilityRow}>
          <View
            style={[
              styles.availabilityDot,
              { backgroundColor: item.available ? "#22C55E" : AppColors.gray },
            ]}
          />
          <Text
            style={[
              styles.availabilityText,
              { color: item.available ? "#22C55E" : AppColors.gray },
            ]}
          >
            {item.available ? "Available" : "Unavailable"}
          </Text>
        </View>
        <Text style={styles.doctorName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.doctorSpeciality}>{item.speciality}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.doctorDegree}>{item.degree}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.doctorExperience}>{item.experience}</Text>
        </View>
        <Text style={styles.doctorFees}>₹{item.fees}</Text>
      </View>
      <TouchableOpacity style={styles.callButton}>
        <Feather name="phone-call" size={20} color={AppColors.primaryColor} />
      </TouchableOpacity>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Doctors</Text>
        <Text style={styles.headerSubtitle}>
          Browse through our specialist doctors
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          data={SPECIALITIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: string) => item}
          renderItem={({ item }: { item: string }) => renderFilterChip(item)}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Doctor List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primaryColor} />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDoctors.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="medical-outline"
            size={60}
            color={AppColors.primaryLight}
          />
          <Text style={styles.emptyTitle}>No doctors found</Text>
          <Text style={styles.emptySubtitle}>
            No doctors available for this speciality
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setActiveFilter("All")}
          >
            <Text style={styles.retryText}>Show All</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item: Doctor) => item._id}
          renderItem={renderDoctorCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 40,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.primaryColor,
  },
  headerSubtitle: {
    fontSize: 14,
    color: AppColors.gray,
    marginTop: 4,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 25,
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: AppColors.primaryColor,
    borderColor: AppColors.primaryColor,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: AppColors.primaryColor,
  },
  filterTextActive: {
    color: AppColors.white,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  retryText: {
    color: AppColors.white,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.black,
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.gray,
    marginTop: 6,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { height: 2, width: 0 },
    shadowRadius: 8,
    elevation: 2,
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: AppColors.primaryLight,
  },
  doctorDetails: {
    flex: 1,
    marginLeft: 12,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "500",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.black,
  },
  doctorSpeciality: {
    fontSize: 13,
    color: AppColors.primaryColor,
    marginTop: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  doctorDegree: {
    fontSize: 12,
    color: AppColors.gray,
  },
  separator: {
    color: AppColors.gray,
    fontSize: 12,
  },
  doctorExperience: {
    fontSize: 12,
    color: AppColors.gray,
  },
  doctorFees: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.secondaryColor,
    marginTop: 3,
  },
  callButton: {
    padding: 12,
    borderRadius: 15,
    backgroundColor: AppColors.primaryLight,
    marginLeft: 8,
  },
});
