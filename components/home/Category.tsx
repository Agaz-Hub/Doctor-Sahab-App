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
import { router } from "expo-router";

const CATEGORIES = [
  {
    image: require("@/assets/images/category/1.png"),
    speciality: "General Physician",
  },
  {
    image: require("@/assets/images/category/2.png"),
    speciality: "Gynecologist",
  },
  {
    image: require("@/assets/images/category/3.png"),
    speciality: "Dermatologist",
  },
  {
    image: require("@/assets/images/category/4.png"),
    speciality: "Pediatricians",
  },
  {
    image: require("@/assets/images/category/5.png"),
    speciality: "Neurologist",
  },
  {
    image: require("@/assets/images/category/6.png"),
    speciality: "Gastroenterologist",
  },
  {
    image: require("@/assets/images/category/7.png"),
    speciality: "Cardiologist",
  },
];

interface ButtonProps {
  image: ImageSourcePropType;
  speciality: string;
}

const Button: React.FC<ButtonProps> = ({ image, speciality }) => {
  return (
    <TouchableOpacity
      style={styles.categoryButton}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/doctors",
          params: { speciality },
        })
      }
    >
      <Image source={image} style={styles.categoryImage} resizeMode="cover" />
    </TouchableOpacity>
  );
};

const Button2: React.FC = () => {
  return (
    <TouchableOpacity
      style={styles.seeAllButton}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/doctors",
          params: { speciality: "All" },
        })
      }
    >
      <Text style={styles.seeAllText}>See all</Text>
    </TouchableOpacity>
  );
};

export default function Category() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medical Specialist</Text>
      <View style={styles.row}>
        {CATEGORIES.slice(0, 4).map((cat) => (
          <Button
            key={cat.speciality}
            image={cat.image}
            speciality={cat.speciality}
          />
        ))}
      </View>
      <View style={styles.row}>
        {CATEGORIES.slice(4, 7).map((cat) => (
          <Button
            key={cat.speciality}
            image={cat.image}
            speciality={cat.speciality}
          />
        ))}
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
