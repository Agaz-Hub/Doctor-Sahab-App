import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppColors } from "@/constants/colors";

interface SearchProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function Search({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search Doctor ...",
  autoFocus = false,
}: SearchProps) {
  const [localTerm, setLocalTerm] = useState("");

  // Use controlled value if provided, otherwise internal state
  const searchTerm = value !== undefined ? value : localTerm;
  const handleChange = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    } else {
      setLocalTerm(text);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchIconContainer}
        onPress={() => onSubmit?.(searchTerm)}
      >
        <Feather name="search" size={24} color={AppColors.primaryColor} />
      </TouchableOpacity>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        value={searchTerm}
        onChangeText={handleChange}
        onSubmitEditing={() => onSubmit?.(searchTerm)}
        placeholderTextColor={AppColors.gray}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {searchTerm.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => handleChange("")}
        >
          <Feather name="x" size={18} color={AppColors.gray} />
        </TouchableOpacity>
      )}
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
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
});
