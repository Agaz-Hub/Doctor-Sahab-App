import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppColors } from "@/constants/colors";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchIconContainer}>
        <Feather name="search" size={24} color={AppColors.primaryColor} />
      </TouchableOpacity>
      <TextInput
        style={styles.textInput}
        placeholder="Search Doctor ..."
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
        placeholderTextColor={AppColors.gray}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
  },
  searchIconContainer: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: 42,
  },
});
