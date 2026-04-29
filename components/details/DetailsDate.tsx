import { AppColors } from "@/constants/colors";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Day {
  day: string;
  date: number;
  month: number;
  year: number;
  fullDate: string;
}

interface DetailsDateProps {
  onDateSelect?: (date: string) => void;
  shifts?: Array<{
    id: string;
    label: string;
    startTime: string;
    endTime: string;
  }>;
  dateShiftAvailability?: Record<
    string,
    Record<string, { isFull?: boolean; remainingMinutes?: number }>
  >;
}

const parseDateKey = (fullDate: string): Date | null => {
  const [day, month, year] = fullDate.split("_").map(Number);
  if (!day || !month || !year) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isPastDate = (fullDate: string): boolean => {
  const date = parseDateKey(fullDate);
  if (!date) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

const isTodayDate = (fullDate: string): boolean => {
  const date = parseDateKey(fullDate);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const parseHHMMToMinutes = (time: string): number | null => {
  if (!time || !time.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const getLocalAvailableShiftCount = (
  fullDate: string,
  shifts: Array<{ startTime: string; endTime: string }>,
): number => {
  if (isPastDate(fullDate)) return 0;

  if (!isTodayDate(fullDate)) {
    return shifts.length;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return shifts.filter((shift) => {
    const startMinutes = parseHHMMToMinutes(shift.startTime);
    const endMinutes = parseHHMMToMinutes(shift.endTime);
    if (
      startMinutes === null ||
      endMinutes === null ||
      startMinutes >= endMinutes
    ) {
      return false;
    }
    return endMinutes > nowMinutes;
  }).length;
};

const getAvailableShiftCountForDate = (
  fullDate: string,
  shifts: Array<{ id: string; startTime: string; endTime: string }>,
  dateShiftAvailability: Record<
    string,
    Record<string, { isFull?: boolean; remainingMinutes?: number }>
  >,
): number => {
  const shiftMap = dateShiftAvailability[fullDate] || {};
  if (Object.keys(shiftMap).length > 0) {
    return shifts.filter((shift) => shiftMap[shift.id]?.isFull !== true).length;
  }

  return getLocalAvailableShiftCount(fullDate, shifts);
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
  shifts = [],
  dateShiftAvailability = {},
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

  useEffect(() => {
    if (days.length === 0) return;

    const selectedStillAvailable =
      selectedDate &&
      getAvailableShiftCountForDate(
        selectedDate,
        shifts,
        dateShiftAvailability,
      ) > 0;

    if (selectedStillAvailable) {
      return;
    }

    const firstAvailableDay = days.find(
      (item) =>
        getAvailableShiftCountForDate(
          item.fullDate,
          shifts,
          dateShiftAvailability,
        ) > 0,
    );

    if (firstAvailableDay) {
      setSelectedDate(firstAvailableDay.fullDate);
      onDateSelect?.(firstAvailableDay.fullDate);
    }
  }, [days, selectedDate, shifts, dateShiftAvailability, onDateSelect]);

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

    // Keep selection in sync from date/availability effect.
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
            const availableCount = getAvailableShiftCountForDate(
              item.fullDate,
              shifts,
              dateShiftAvailability,
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
