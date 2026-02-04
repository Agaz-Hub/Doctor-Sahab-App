import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { AppColors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";

interface Day {
  day: string;
  date: number;
}

interface WeekButtonProps {
  day: string;
  date: number;
  onPress: () => void;
  isSelected: boolean;
  index: number;
}

const WeekButton: React.FC<WeekButtonProps> = ({
  day,
  date,
  onPress,
  isSelected,
  index,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      {
        marginLeft: index === 0 ? 0 : 15,
        borderWidth: isSelected ? 1 : 0,
        borderColor: isSelected ? AppColors.primaryColor : undefined,
      },
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.buttonText,
        {
          color: isSelected ? AppColors.primaryColor : "gray",
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
          color: isSelected ? AppColors.primaryColor : "gray",
          fontWeight: isSelected ? "bold" : "400",
        },
      ]}
    >
      {date}
    </Text>
  </TouchableOpacity>
);

export default function DetailsDate() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days: Day[] = [
    { day: "Sun", date: 6 },
    { day: "Mon", date: 7 },
    { day: "Tue", date: 8 },
    { day: "Wed", date: 9 },
    { day: "Thu", date: 10 },
    { day: "Fri", date: 11 },
    { day: "Sat", date: 12 },
  ];

  const handlePress = (day: string) => {
    setSelectedDay(day);
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Select Date</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.dateText}>April 2024</Text>
          <Feather name="edit-3" size={22} color="gray" />
        </TouchableOpacity>
      </View>

      <View style={styles.daysContainer}>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          {days.map((item, index) => (
            <WeekButton
              key={item.day}
              day={item.day}
              date={item.date}
              isSelected={selectedDay === item.day}
              onPress={() => handlePress(item.day)}
              index={index}
            />
          ))}
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
  editButton: {
    gap: 14,
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
  },
  dateText: {
    color: "gray",
    fontSize: 20,
    fontWeight: "700",
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
  },
  buttonText: {
    textAlign: "center",
    color: "gray",
    marginTop: 5,
    fontSize: 16,
  },
});
