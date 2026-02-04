import { StyleSheet, SafeAreaView, StatusBar, View, Text } from "react-native";
import React from "react";
import { AppColors } from "@/constants/colors";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.white} />
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Your profile information will appear here
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.primaryColor,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.gray,
    textAlign: "center",
  },
});
