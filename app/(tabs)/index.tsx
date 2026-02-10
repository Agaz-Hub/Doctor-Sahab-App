import {
  Platform,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import React from "react";
import Header from "@/components/home/Header";
import Search from "@/components/home/Search";
import HeadLine from "@/components/home/HeadLine";
import Category from "@/components/home/Category";
import DoctorList from "@/components/home/DoctorList";
import ActionButtons from "@/components/home/ActionButtons";
import { AppColors } from "@/constants/colors";
import { router } from "expo-router";

export default function HomeScreen() {
  const handleSearch = (text: string) => {
    if (text.trim()) {
      router.push({
        pathname: "/(tabs)/doctors",
        params: { search: text.trim() },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.white} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <Search onSubmit={handleSearch} placeholder="Search Doctor ..." />
        <HeadLine />
        <Category />
        <DoctorList />
        <ActionButtons />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: Platform.OS === "ios" ? 0 : 30,
  },
});
