import { Link } from "expo-router";
import { StyleSheet, View, Text } from "react-native";

import { AppColors } from "@/constants/colors";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: AppColors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.black,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    lineHeight: 30,
    color: AppColors.primaryColor,
  },
});
