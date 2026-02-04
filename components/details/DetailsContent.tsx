import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { AppColors } from "@/constants/colors";
import DetailsDate from "./DetailsDate";
import DetailsTime from "./DetailsTime";

export default function DetailsContent() {
  return (
    <View>
      <Text style={styles.title}>About Doctor</Text>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          Jane practises nephrology in fitchburg, Wiscosin. Cooper has been
          practising medicine for over ...{" "}
          <Text style={styles.readMore}>Read More</Text>
        </Text>
      </View>
      <View style={styles.dateContainer}>
        <DetailsDate />
      </View>
      <View style={styles.timeContainer}>
        <DetailsTime />
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
  dateContainer: {
    marginTop: 25,
  },
  timeContainer: {
    marginTop: 25,
  },
});
