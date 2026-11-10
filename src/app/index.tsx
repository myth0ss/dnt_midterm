import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";

import { router } from "expo-router";

import { auth } from "../../firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu");

      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      router.replace("/admin" as any);
    } catch (error: any) {
      console.error(error);

      let message = "Đăng nhập thất bại";

      if (error.code === "auth/invalid-credential") {
        message = "Email hoặc mật khẩu không đúng";
      }

      if (error.code === "auth/invalid-email") {
        message = "Email không hợp lệ";
      }

      if (error.code === "auth/too-many-requests") {
        message = "Bạn đã thử đăng nhập quá nhiều lần";
      }

      Alert.alert("Lỗi đăng nhập", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginCard}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>A</Text>
        </View>

        <Text style={styles.title}>Admin Login</Text>

        <Text style={styles.subtitle}>
          Đăng nhập để truy cập hệ thống quản lý người dùng
        </Text>

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="admin@gmail.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mật khẩu</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>User Management System</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    padding: 20,

    backgroundColor: "#f1f5f9",
  },

  loginCard: {
    width: "100%",
    maxWidth: 440,

    backgroundColor: "#ffffff",

    padding: 30,

    borderRadius: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,

    elevation: 5,
  },

  iconCircle: {
    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor: "#2563eb",

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",

    marginBottom: 18,
  },

  iconText: {
    color: "#ffffff",

    fontSize: 28,
    fontWeight: "800",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",

    textAlign: "center",

    color: "#0f172a",
  },

  subtitle: {
    fontSize: 14,

    textAlign: "center",

    color: "#64748b",

    marginTop: 8,
    marginBottom: 28,

    lineHeight: 20,
  },

  label: {
    fontSize: 14,

    fontWeight: "600",

    color: "#334155",

    marginBottom: 7,
  },

  input: {
    height: 50,

    borderWidth: 1,
    borderColor: "#dbe2ea",

    borderRadius: 10,

    paddingHorizontal: 14,

    marginBottom: 17,

    backgroundColor: "#f8fafc",

    fontSize: 15,

    color: "#0f172a",
  },

  loginButton: {
    height: 50,

    backgroundColor: "#2563eb",

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 5,
  },

  loginButtonText: {
    color: "#ffffff",

    fontSize: 16,

    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  footer: {
    marginTop: 22,

    textAlign: "center",

    color: "#94a3b8",

    fontSize: 12,
  },
});
