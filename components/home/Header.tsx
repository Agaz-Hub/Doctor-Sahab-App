import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AppColors } from "@/constants/colors";

export default function Header() {
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("@/assets/images/icon/menu.png")}
          style={styles.menuIcon}
        />
      </View>
      <View style={styles.locationContainer}>
        <MaterialIcons
          name="location-on"
          size={24}
          color={AppColors.primaryColor}
        />
        <Text style={styles.locationText}>New Delhi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    alignItems: "center",
  },
  locationText: {
    color: AppColors.black,
    fontSize: 14,
  },
});
