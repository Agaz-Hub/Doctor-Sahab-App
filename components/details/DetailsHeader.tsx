import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import React from "react";
import { AppColors } from "@/constants/colors";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";

export default function DetailsHeader() {
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Ionicons name="arrow-back" size={15} color={AppColors.white} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity style={styles.button}>
          {/* @ts-expect-error - sharealt is a valid icon name in AntDesign */}
          <AntDesign name="sharealt" size={15} color={AppColors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 24) + 10,
  },
  button: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: AppColors.white,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
