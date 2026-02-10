import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { AppColors } from "@/constants/colors";
import DetailsDate from "./DetailsDate";
import DetailsTime from "./DetailsTime";
import { Ionicons } from "@expo/vector-icons";

interface DetailsContentProps {
  about?: string;
  fees?: number;
  available?: boolean;
  slotsBooked?: Record<string, string[]>;
  address?: {
    line1?: string;
    line2?: string;
  };
  onDateSelect?: (date: string) => void;
  onTimeSelect?: (time: string) => void;
}

export default function DetailsContent({
  about,
  fees,
  available,
  slotsBooked = {},
  address,
  onDateSelect,
  onTimeSelect,
}: DetailsContentProps) {
  const [showFullText, setShowFullText] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const aboutText = about || "No information available.";
  const shouldTruncate = aboutText.length > 150;
  const displayText =
    showFullText || !shouldTruncate
      ? aboutText
      : aboutText.substring(0, 150) + "...";

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleTimeSelect = (time: string) => {
    onTimeSelect?.(time);
  };

  const bookedTimesForDate = selectedDate
    ? slotsBooked[selectedDate] || []
    : [];

  const addressText =
    address?.line1 || address?.line2
      ? [address.line1, address.line2].filter(Boolean).join(", ")
      : null;

  return (
    <View>
      <Text style={styles.title}>About Doctor</Text>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {displayText}{" "}
          {shouldTruncate && (
            <Text
              style={styles.readMore}
              onPress={() => setShowFullText(!showFullText)}
            >
              {showFullText ? "Read Less" : "Read More"}
            </Text>
          )}
        </Text>
      </View>

      {addressText && (
        <View style={styles.addressContainer}>
          <Ionicons
            name="location-outline"
            size={18}
            color={AppColors.primaryColor}
          />
          <Text style={styles.addressText}>{addressText}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Consultation Fee</Text>
          <Text style={styles.infoValue}>Rs. {fees || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Availability</Text>
          <Text
            style={[styles.infoValue, { color: available ? "green" : "red" }]}
          >
            {available ? "Available" : "Not Available"}
          </Text>
        </View>
      </View>
      <View style={styles.dateContainer}>
        <DetailsDate
          onDateSelect={handleDateSelect}
          bookedSlots={slotsBooked}
        />
      </View>
      <View style={styles.timeContainer}>
        <DetailsTime
          onTimeSelect={handleTimeSelect}
          bookedTimes={bookedTimesForDate}
          selectedDate={selectedDate || undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: AppColors.primaryColor,
    fontSize: 20,
    fontWeight: "700",
  },
  descriptionContainer: {
    marginTop: 18,
  },
  description: {
    color: "gray",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  readMore: {
    color: AppColors.secondaryColor,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "gray",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.primaryColor,
    marginTop: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  dateContainer: {
    marginTop: 25,
  },
  timeContainer: {
    marginTop: 25,
  },
});
