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
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

interface DetailsTimeProps {
  onTimeSelect?: (shiftId: string) => void;
  shifts?: TimeSlot[];
  selectedDate?: string | null;
  shiftAvailability?: Record<
    string,
    { isFull?: boolean; remainingMinutes?: number }
  >;
}

const parseDateKey = (dateKey: string | null | undefined): Date | null => {
  if (!dateKey) return null;
  const [day, month, year] = dateKey.split("_").map(Number);
  if (!day || !month || !year) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseHHMMToMinutes = (time: string): number | null => {
  if (!time || !time.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

interface TimeButtonProps {
  label: string;
  subtitle: string;
  onPress: () => void;
  isSelected: boolean;
  isBooked: boolean;
  index: number;
}

const TimeButton: React.FC<TimeButtonProps> = ({
  label,
  subtitle,
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
    <Text style={styles.subtitleText}>{subtitle}</Text>
    {isBooked && <Text style={styles.bookedText}>Full</Text>}
  </TouchableOpacity>
);

export default function DetailsTime({
  onTimeSelect,
  shifts = [],
  selectedDate,
  shiftAvailability = {},
}: DetailsTimeProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate, JSON.stringify(shifts)]);

  const handleTimePress = (time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
  };

  const isTimeBooked = (shiftId: string) => {
    return shiftAvailability[shiftId]?.isFull === true;
  };

  const isPastDate = (dateKey: string | null | undefined): boolean => {
    const date = parseDateKey(dateKey);
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelectedDateToday = (dateKey: string | null | undefined): boolean => {
    const date = parseDateKey(dateKey);
    if (!date) return false;
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const isPastShiftWindow = (shift: TimeSlot): boolean => {
    if (!isSelectedDateToday(selectedDate)) return false;
    const endMinutes = parseHHMMToMinutes(shift.endTime);
    if (endMinutes === null) return false;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return endMinutes <= nowMinutes;
  };

  const isShiftDisabled = (shift: TimeSlot): boolean => {
    if (isPastDate(selectedDate)) return true;
    if (isPastShiftWindow(shift)) return true;
    return isTimeBooked(shift.id);
  };

  const availableCount = shifts.filter(
    (shift) => !isShiftDisabled(shift),
  ).length;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Select Shift</Text>
        <Text style={styles.availableText}>
          {availableCount} shifts available
        </Text>
      </View>
      <View style={styles.container}>
        {shifts.length > 0 ? (
          <ScrollView showsHorizontalScrollIndicator={false} horizontal>
            {shifts.map((shift, index) => (
              <TimeButton
                key={shift.id}
                label={shift.label}
                subtitle={`${shift.startTime} - ${shift.endTime}`}
                index={index}
                isSelected={selectedTime === shift.id}
                isBooked={isShiftDisabled(shift)}
                onPress={() => handleTimePress(shift.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noSlotsText}>No shifts available</Text>
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
  subtitleText: {
    fontSize: 11,
    color: "#666",
    marginTop: 3,
  },
  noSlotsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    paddingVertical: 20,
  },
});
