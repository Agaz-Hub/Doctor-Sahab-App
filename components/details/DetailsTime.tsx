import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AppColors } from "@/constants/colors";

interface TimeSlot {
  label: string;
  value: string;
}

interface DetailsTimeProps {
  onTimeSelect?: (time: string) => void;
  bookedTimes?: string[];
  selectedDate?: string;
}

interface TimeButtonProps {
  label: string;
  onPress: () => void;
  isSelected: boolean;
  isBooked: boolean;
  index: number;
}

const TimeButton: React.FC<TimeButtonProps> = ({
  label,
  onPress,
  isSelected,
  isBooked,
  index,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      {
        marginLeft: index === 0 ? 0 : 15,
        borderWidth: isSelected ? 1 : 0,
        borderColor: isSelected ? AppColors.primaryColor : undefined,
        backgroundColor: isBooked ? "#E0E0E0" : "#F8F8F8",
        opacity: isBooked ? 0.6 : 1,
      },
    ]}
    onPress={onPress}
    disabled={isBooked}
  >
    <Text
      style={[
        styles.buttonText,
        {
          color: isBooked
            ? "#999"
            : isSelected
              ? AppColors.primaryColor
              : "gray",
          fontWeight: isSelected ? "bold" : "400",
          textDecorationLine: isBooked ? "line-through" : "none",
        },
      ]}
    >
      {label}
    </Text>
    {isBooked && <Text style={styles.bookedText}>Booked</Text>}
  </TouchableOpacity>
);

export default function DetailsTime({
  onTimeSelect,
  bookedTimes = [],
  selectedDate,
}: DetailsTimeProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Reset selection when date changes
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  // Generate time slots from 9 AM to 8 PM
  const allTimes: TimeSlot[] = [
    { label: "09:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "01:00 PM", value: "13:00" },
    { label: "02:00 PM", value: "14:00" },
    { label: "03:00 PM", value: "15:00" },
    { label: "04:00 PM", value: "16:00" },
    { label: "05:00 PM", value: "17:00" },
    { label: "06:00 PM", value: "18:00" },
    { label: "07:00 PM", value: "19:00" },
    { label: "08:00 PM", value: "20:00" },
  ];

  // Check if selected date is today to filter past times
  const isToday = () => {
    if (!selectedDate) return false;
    const today = new Date();
    const todayFormatted = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    return selectedDate === todayFormatted;
  };

  // Filter times - remove past slots if today
  const times = allTimes.filter((slot) => {
    if (!isToday()) return true;
    const now = new Date();
    const [hours] = slot.value.split(":").map(Number);
    return hours > now.getHours();
  });

  const handleTimePress = (time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
  };

  const isTimeBooked = (time: string) => {
    return bookedTimes.includes(time);
  };

  const availableCount = times.filter((t) => !isTimeBooked(t.value)).length;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Select Time</Text>
        <Text style={styles.availableText}>
          {availableCount} slots available
        </Text>
      </View>
      <View style={styles.container}>
        {times.length > 0 ? (
          <ScrollView showsHorizontalScrollIndicator={false} horizontal>
            {times.map(({ label, value }, index) => (
              <TimeButton
                key={value}
                label={label}
                index={index}
                isSelected={selectedTime === value}
                isBooked={isTimeBooked(value)}
                onPress={() => handleTimePress(value)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noSlotsText}>
            {isToday() ? "No more slots available today" : "No slots available"}
          </Text>
        )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availableText: {
    fontSize: 12,
    color: "gray",
  },
  container: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "gray",
    fontSize: 14,
  },
  bookedText: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  noSlotsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    paddingVertical: 20,
  },
});
