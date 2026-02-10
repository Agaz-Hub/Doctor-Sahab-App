import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AppColors } from "@/constants/colors";

interface Day {
  day: string;
  date: number;
  month: number;
  year: number;
  fullDate: string;
}

interface DetailsDateProps {
  onDateSelect?: (date: string) => void;
  bookedSlots?: Record<string, string[]>;
}

const TOTAL_SLOTS = 12; // 9AM to 8PM = 12 slots
const ALL_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

// Helper to check if a date is today
const isDateToday = (fullDate: string): boolean => {
  const today = new Date();
  const todayFormatted = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
  return fullDate === todayFormatted;
};

// Get available slots count for a date (accounting for past hours if today)
const getAvailableSlotsCount = (
  fullDate: string,
  bookedSlots: string[],
): number => {
  let availableSlots = ALL_TIME_SLOTS;

  // If today, filter out past time slots
  if (isDateToday(fullDate)) {
    const currentHour = new Date().getHours();
    availableSlots = ALL_TIME_SLOTS.filter((slot) => {
      const [hours] = slot.split(":").map(Number);
      return hours > currentHour;
    });
  }

  // Subtract booked slots
  const availableCount = availableSlots.filter(
    (slot) => !bookedSlots.includes(slot),
  ).length;
  return availableCount;
};

interface WeekButtonProps {
  day: string;
  date: number;
  onPress: () => void;
  isSelected: boolean;
  index: number;
  availableCount: number;
  isFullyBooked: boolean;
}

const WeekButton: React.FC<WeekButtonProps> = ({
  day,
  date,
  onPress,
  isSelected,
  index,
  availableCount,
  isFullyBooked,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      {
        marginLeft: index === 0 ? 0 : 15,
        borderWidth: isSelected ? 1 : 0,
        borderColor: isSelected ? AppColors.primaryColor : undefined,
        backgroundColor: isFullyBooked ? "#FFE5E5" : "#F8F8F8",
        opacity: isFullyBooked ? 0.7 : 1,
      },
    ]}
    onPress={onPress}
    disabled={isFullyBooked}
  >
    <Text
      style={[
        styles.buttonText,
        {
          color: isFullyBooked
            ? "#999"
            : isSelected
              ? AppColors.primaryColor
              : "gray",
          fontWeight: isSelected ? "bold" : "400",
        },
      ]}
    >
      {day}
    </Text>
    <Text
      style={[
        styles.buttonText,
        {
          color: isFullyBooked
            ? "#999"
            : isSelected
              ? AppColors.primaryColor
              : "gray",
          fontWeight: isSelected ? "bold" : "400",
        },
      ]}
    >
      {date}
    </Text>
    <Text
      style={[
        styles.slotCount,
        {
          color: isFullyBooked
            ? "#FF6B6B"
            : availableCount < 5
              ? "#FFA500"
              : "#4CAF50",
        },
      ]}
    >
      {isFullyBooked ? "Full" : `${availableCount} left`}
    </Text>
  </TouchableOpacity>
);

export default function DetailsDate({
  onDateSelect,
  bookedSlots = {},
}: DetailsDateProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    generateDays();
  }, []);

  const generateDays = () => {
    const today = new Date();
    const generatedDays: Day[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayIndex = date.getDay();
      const dateNum = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();

      // Format: "10_2_2026" (day_month_year)
      const fullDate = `${dateNum}_${month + 1}_${year}`;

      generatedDays.push({
        day: dayNames[dayIndex],
        date: dateNum,
        month: month,
        year: year,
        fullDate: fullDate,
      });
    }

    setDays(generatedDays);
    setCurrentMonth(`${monthNames[today.getMonth()]} ${today.getFullYear()}`);

    // Auto-select first date
    if (generatedDays.length > 0) {
      setSelectedDate(generatedDays[0].fullDate);
      onDateSelect?.(generatedDays[0].fullDate);
    }
  };

  const handlePress = (fullDate: string) => {
    setSelectedDate(fullDate);
    onDateSelect?.(fullDate);
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Select Date</Text>
        <Text style={styles.dateText}>{currentMonth}</Text>
      </View>

      <View style={styles.daysContainer}>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          {days.map((item, index) => {
            const bookedForDate = bookedSlots[item.fullDate] || [];
            const availableCount = getAvailableSlotsCount(
              item.fullDate,
              bookedForDate,
            );
            const isFullyBooked = availableCount === 0;
            return (
              <WeekButton
                key={item.fullDate}
                day={item.day}
                date={item.date}
                isSelected={selectedDate === item.fullDate}
                onPress={() => handlePress(item.fullDate)}
                index={index}
                availableCount={availableCount}
                isFullyBooked={isFullyBooked}
              />
            );
          })}
        </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  dateText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "600",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 25,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "gray",
    marginTop: 5,
    fontSize: 16,
  },
  slotCount: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
});
