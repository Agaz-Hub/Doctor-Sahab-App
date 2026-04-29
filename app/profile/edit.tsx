import { AppColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function EditProfileScreen() {
  const router = useRouter();
  const { token, user, refreshProfile } = useAuth();

  const [initialValues, setInitialValues] = useState({
    name: "",
    phone: "",
    dob: "",
    gender: "",
    address1: "",
    address2: "",
    photoUrl: "",
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;
    const nextValues = {
      name: user.name || "",
      phone: user.phone ? String(user.phone) : "",
      dob: user.dob || "",
      gender: user.gender || "",
      address1: user.address?.line1 || "",
      address2: user.address?.line2 || "",
      photoUrl: user.image || "",
    };

    setName(nextValues.name);
    setPhone(nextValues.phone);
    setDob(nextValues.dob);
    setGender(nextValues.gender);
    setAddress1(nextValues.address1);
    setAddress2(nextValues.address2);
    setPhotoUrl(nextValues.photoUrl);
    setInitialValues(nextValues);
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const previewUri = useMemo(() => {
    const trimmed = (photoUrl || "").trim();
    return trimmed.length > 0 ? trimmed : user?.image || "";
  }, [photoUrl, user?.image]);

  const hasChanges = useMemo(() => {
    const trim = (value: string) => value.trim();
    return (
      trim(name) !== trim(initialValues.name) ||
      trim(phone) !== trim(initialValues.phone) ||
      trim(dob) !== trim(initialValues.dob) ||
      trim(gender) !== trim(initialValues.gender) ||
      trim(address1) !== trim(initialValues.address1) ||
      trim(address2) !== trim(initialValues.address2) ||
      trim(photoUrl) !== trim(initialValues.photoUrl)
    );
  }, [
    name,
    phone,
    dob,
    gender,
    address1,
    address2,
    photoUrl,
    initialValues,
  ]);

  const saveProfile = async () => {
    if (!BACKEND_URL) {
      Alert.alert(
        "Configuration Error",
        "Backend URL is missing. Please check EXPO_PUBLIC_BACKEND_URL.",
      );
      return;
    }

    if (!token) {
      Alert.alert(
        "Login Required",
        "Please login again to update your profile.",
      );
      return;
    }

    if (!hasChanges) {
      Alert.alert("No Changes", "Update any field before saving.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }

    if (dob.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      Alert.alert("Validation", "DOB must be in YYYY-MM-DD format.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      formData.append("dob", dob.trim());
      formData.append("gender", gender.trim());
      formData.append(
        "address",
        JSON.stringify({
          line1: address1.trim(),
          line2: address2.trim(),
        }),
      );

      if (photoUrl.trim()) {
        formData.append("imageUrl", photoUrl.trim());
      }

      const response = await fetch(`${BACKEND_URL}/api/users/me/profile`, {
        method: "PUT",
        headers: { token },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        Alert.alert(
          "Update Failed",
          data.message || "Could not update profile.",
        );
        return;
      }

      await refreshProfile();
      Alert.alert("Profile Updated", "Your details were saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.backgroundAccentTop} />
      <View style={styles.backgroundAccentBottom} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={22}
            color={AppColors.primaryColor}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>Keep your details up to date</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons
                  name="person"
                  size={34}
                  color={AppColors.primaryColor}
                />
              </View>
            )}
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroName}>{user?.name || "Your Profile"}</Text>
            <Text style={styles.heroEmail}>{user?.email || ""}</Text>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#1F7A4F" />
              <Text style={styles.heroBadgeText}>Verified Patient</Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={AppColors.gray}
              autoCapitalize="words"
              textContentType="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Add a phone number"
              keyboardType="phone-pad"
              placeholderTextColor={AppColors.gray}
              textContentType="telephoneNumber"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroupCompact}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={AppColors.gray}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.inputGroupCompact}>
              <Text style={styles.inputLabel}>Gender</Text>
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="e.g. Female"
                placeholderTextColor={AppColors.gray}
                autoCapitalize="words"
              />
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Address</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={address1}
              onChangeText={setAddress1}
              placeholder="Address line 1"
              placeholderTextColor={AppColors.gray}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Apartment, Suite, etc.</Text>
            <TextInput
              style={styles.input}
              value={address2}
              onChangeText={setAddress2}
              placeholder="Address line 2 (optional)"
              placeholderTextColor={AppColors.gray}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color="#1E6FD9" />
          <Text style={styles.infoText}>
            Profile photos are managed in your account settings.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!hasChanges || saving) && { opacity: 0.7 },
          ]}
          onPress={saveProfile}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  backgroundAccentTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#EAF2FF",
    opacity: 0.8,
  },
  backgroundAccentBottom: {
    position: "absolute",
    bottom: -140,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#FFEFE6",
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 12,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryLighter,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primaryColor,
  },
  headerSubtitle: {
    fontSize: 12,
    color: AppColors.gray,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
  },
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#0F1B3D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  avatarWrap: {
    alignItems: "center",
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: {
    flex: 1,
  },
  heroName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.black,
    marginBottom: 2,
  },
  heroEmail: {
    fontSize: 13,
    color: AppColors.gray,
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5F6EE",
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F7A4F",
  },
  formCard: {
    backgroundColor: AppColors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
    padding: 16,
    gap: 12,
    shadowColor: "#0F1B3D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.primaryColor,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputGroupCompact: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    color: AppColors.gray,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FCFCFF",
    color: AppColors.black,
  },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#E9F1FF",
    borderWidth: 1,
    borderColor: "#D6E5FF",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1E3A6D",
  },
  saveBtn: {
    backgroundColor: AppColors.primaryColor,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
