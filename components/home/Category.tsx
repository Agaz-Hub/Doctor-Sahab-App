import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from "react-native";
import React from "react";
import { AppColors } from "@/constants/colors";

interface ButtonProps {
  image: ImageSourcePropType;
}

const Button: React.FC<ButtonProps> = ({ image }) => {
  return (
    <TouchableOpacity style={styles.categoryButton}>
      <Image source={image} style={styles.categoryImage} resizeMode="cover" />
    </TouchableOpacity>
  );
};

const Button2: React.FC = () => {
  return (
    <TouchableOpacity style={styles.seeAllButton}>
      <Text style={styles.seeAllText}>See all</Text>
    </TouchableOpacity>
  );
};

export default function Category() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medical Specialist</Text>
      <View style={styles.row}>
        <Button image={require("@/assets/images/category/1.png")} />
        <Button image={require("@/assets/images/category/2.png")} />
        <Button image={require("@/assets/images/category/3.png")} />
        <Button image={require("@/assets/images/category/4.png")} />
      </View>
      <View style={styles.row}>
        <Button image={require("@/assets/images/category/5.png")} />
        <Button image={require("@/assets/images/category/6.png")} />
        <Button image={require("@/assets/images/category/7.png")} />
        <Button2 />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  title: {
    color: AppColors.primaryColor,
    fontSize: 20,
    fontWeight: "700",
  },
  row: {
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    gap: 25,
    marginTop: 18,
  },
  categoryButton: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { height: 0.2, width: 0.2 },
    elevation: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: AppColors.white,
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryImage: {
    width: 35,
    height: 35,
  },
  seeAllButton: {
    borderRadius: 20,
    backgroundColor: AppColors.secondaryColor,
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllText: {
    color: AppColors.white,
    fontSize: 14,
  },
});
