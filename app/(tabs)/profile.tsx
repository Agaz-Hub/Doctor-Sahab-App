import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { AppColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const {
    token,
    user,
    loading: authLoading,
    login,
    register,
    logout,
  } = useAuth();

  // Auth form state
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async () => {
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Missing Fields", "Please enter email and password.");
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        Alert.alert("Missing Fields", "Please fill in all fields.");
        return;
      }
      if (password.length < 8) {
        Alert.alert("Weak Password", "Password must be at least 8 characters.");
        return;
      }
    }

    setSubmitting(true);
    const result = isLogin
      ? await login(email.trim(), password)
      : await register(name.trim(), email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      Alert.alert("Error", result.message || "Something went wrong.");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryColor} />
      </View>
    );
  }

  // ---------- NOT LOGGED IN: show login / sign up ----------
  if (!token || !user) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.authScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authHeader}>
            <View style={styles.authLogo}>
              <Ionicons name="medkit" size={36} color={AppColors.white} />
            </View>
            <Text style={styles.authTitle}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>
            <Text style={styles.authSubtitle}>
              {isLogin
                ? "Sign in to access your appointments"
                : "Sign up to get started"}
            </Text>
          </View>

          <View style={styles.authForm}>
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={AppColors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.authInput}
                  placeholder="Full Name"
                  placeholderTextColor={AppColors.gray}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={AppColors.gray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.authInput}
                placeholder="Email"
                placeholderTextColor={AppColors.gray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={AppColors.gray}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.authInput, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={AppColors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={AppColors.gray}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.authButton, submitting && { opacity: 0.7 }]}
              onPress={handleAuth}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={AppColors.white} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setName("");
                setEmail("");
                setPassword("");
              }}
              style={styles.toggleAuth}
            >
              <Text style={styles.toggleAuthText}>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Text style={styles.toggleAuthLink}>
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ---------- LOGGED IN: show profile ----------
  const menuItems = [
    {
      id: 1,
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your personal information",
    },
    {
      id: 2,
      icon: "document-text-outline",
      title: "Medical Records",
      subtitle: "View your health history",
    },
    {
      id: 3,
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage notification preferences",
    },
    {
      id: 4,
      icon: "shield-checkmark-outline",
      title: "Privacy & Security",
      subtitle: "Control your data and privacy",
    },
    {
      id: 5,
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help or contact support",
    },
    {
      id: 6,
      icon: "information-circle-outline",
      title: "About",
      subtitle: "App version and information",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Patient</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={AppColors.primaryColor}
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons
          name="log-out-outline"
          size={20}
          color={AppColors.secondaryColor}
        />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.white,
  },

  // ---- Auth styles ----
  authScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  authHeader: {
    alignItems: "center",
    marginBottom: 36,
  },
  authLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: AppColors.primaryColor,
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 14,
    color: AppColors.gray,
  },
  authForm: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: AppColors.primaryLight,
  },
  inputIcon: {
    marginRight: 10,
  },
  authInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.black,
  },
  eyeIcon: {
    padding: 4,
  },
  authButton: {
    backgroundColor: AppColors.primaryColor,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  authButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  toggleAuth: {
    alignItems: "center",
    marginTop: 10,
  },
  toggleAuthText: {
    fontSize: 14,
    color: AppColors.gray,
  },
  toggleAuthLink: {
    color: AppColors.primaryColor,
    fontWeight: "600",
  },

  // ---- Profile styles ----
  header: {
    backgroundColor: AppColors.white,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.black,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: AppColors.gray,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: AppColors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primaryColor,
  },
  menuContainer: {
    backgroundColor: AppColors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.black,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: AppColors.gray,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.secondaryColor,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: AppColors.gray,
    marginTop: 20,
  },
});
