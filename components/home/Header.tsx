import { AppColors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SvgUri } from "react-native-svg";

const logoUri = Asset.fromModule(require("../../assets/images/logo.svg")).uri;

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.leftSlot}>
        <SvgUri uri={logoUri} width={140} height={30} />
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
  leftSlot: {
    flex: 1,
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
