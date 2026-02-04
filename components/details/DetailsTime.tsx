import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { AppColors } from "@/constants/colors";

interface TimeSlot {
  label: string;
  value: string;
}

interface TimeButtonProps {
  label: string;
  onPress: () => void;
  isSelected: boolean;
  index: number;
}

const TimeButton: React.FC<TimeButtonProps> = ({
  label,
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
      {label}
    </Text>
  </TouchableOpacity>
);

export default function DetailsTime() {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const times: TimeSlot[] = Array.from({ length: 6 }, (_, i) => ({
    label: `${i === 0 ? "12:00" : `${i}:00`} ${i < 2 ? "am" : "pm"}`,
    value: `${i}:00`,
  }));

  const handleTimePress = (time: string) => {
    setSelectedTime(time);
  };

  return (
    <View>
      <Text style={styles.title}>Select Time</Text>
      <View style={styles.container}>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          {times.map(({ label, value }, index) => (
            <TimeButton
              key={label}
              label={label}
              index={index}
              isSelected={selectedTime === value}
              onPress={() => handleTimePress(value)}
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
  container: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 30,
    backgroundColor: "#F8F8F8",
  },
  buttonText: {
    textAlign: "center",
    color: "gray",
    marginTop: 5,
    fontSize: 16,
  },
});
