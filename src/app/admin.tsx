import { useCallback, useEffect, useState } from "react";

import * as ImagePicker from "expo-image-picker";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { router } from "expo-router";

import { auth } from "../../firebaseConfig";

import {
  addUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../services/userService";

import { uploadImage } from "../../services/cloudinaryService";

import type { User, UserInput } from "../types/user";

export default function AdminScreen() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 768;

  // =========================
  // AUTH
  // =========================

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/");

        return;
      }

      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  // =========================
  // STATE
  // =========================

  const [users, setUsers] = useState<User[]>([]);

  const [email, setEmail] = useState("");

  const [matkhau, setMatkhau] = useState("");

  const [hoten, setHoten] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(false);

  // =========================
  // READ
  // =========================

  const loadUsers = useCallback(async () => {
    setFetching(true);

    try {
      const data = await getUsers();

      setUsers(data);
    } catch (error) {
      console.error(error);

      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth) {
      loadUsers();
    }
  }, [checkingAuth, loadUsers]);

  // =========================
  // RESET
  // =========================

  const resetForm = () => {
    setEmail("");
    setMatkhau("");
    setHoten("");

    setImageUri(null);
    setCurrentImageUrl(null);

    setEditingId(null);

    Keyboard.dismiss();
  };

  // =========================
  // IMAGE PICKER
  // =========================

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],

        allowsEditing: true,

        aspect: [1, 1],

        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);

      Alert.alert("Lỗi", "Không thể mở thư viện ảnh");
    }
  };

  // =========================
  // CREATE + UPDATE
  // =========================

  const handleSave = async () => {
    if (!email.trim() || !matkhau.trim() || !hoten.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");

      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Thông báo", "Email không hợp lệ");

      return;
    }

    setLoading(true);

    try {
      let hinhanh = currentImageUrl || "";

      if (imageUri) {
        const image = await uploadImage(imageUri);

        hinhanh = image.imageUrl;
      }

      if (!hinhanh) {
        Alert.alert("Thông báo", "Vui lòng chọn hình ảnh");

        return;
      }

      const userData: UserInput = {
        email: email.trim(),

        matkhau: matkhau.trim(),

        hoten: hoten.trim(),

        hinhanh,
      };

      if (editingId) {
        await updateUser(editingId, userData);

        Alert.alert("Thành công", "Đã cập nhật người dùng");
      } else {
        await addUser(userData);

        Alert.alert("Thành công", "Đã thêm người dùng");
      }

      resetForm();

      await loadUsers();
    } catch (error) {
      console.error(error);

      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (user: User) => {
    setEditingId(user.id);

    setEmail(user.email);

    setMatkhau(user.matkhau);

    setHoten(user.hoten);

    setImageUri(null);

    setCurrentImageUrl(user.hinhanh);
  };

  // =========================
  // DELETE
  // =========================

  const executeDelete = async (id: string) => {
    setLoading(true);

    try {
      await deleteUser(id);

      if (editingId === id) {
        resetForm();
      }

      await loadUsers();

      Alert.alert("Thành công", "Đã xóa người dùng");
    } catch (error) {
      console.error(error);

      Alert.alert("Lỗi", "Không thể xóa người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (globalThis.confirm("Bạn có chắc muốn xóa người dùng này?")) {
        executeDelete(id);
      }

      return;
    }

    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa người dùng này?", [
      {
        text: "Hủy",

        style: "cancel",
      },

      {
        text: "Xóa",

        style: "destructive",

        onPress: () => executeDelete(id),
      },
    ]);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      router.replace("/");
    } catch (error) {
      console.error(error);

      Alert.alert("Lỗi", "Không thể đăng xuất");
    }
  };

  // =========================
  // USER CARD
  // =========================

  const renderUser = ({ item }: { item: User }) => (
    <View style={[styles.userCard, !isDesktop && styles.userCardMobile]}>
      <Image
        source={{
          uri: item.hinhanh,
        }}
        style={styles.userImage}
      />

      <View style={styles.userDetails}>
        <Text style={styles.userName}>{item.hoten}</Text>

        <Text style={styles.userInfo}>{item.email}</Text>

        <Text style={styles.passwordText}>Mật khẩu: ••••••••</Text>
      </View>

      <View style={[styles.actions, !isDesktop && styles.actionsMobile]}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =========================
  // AUTH LOADING
  // =========================

  if (checkingAuth) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#2563eb" />

        <Text style={styles.loadingText}>Đang kiểm tra đăng nhập...</Text>
      </View>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshing={fetching}
        onRefresh={loadUsers}
        ListHeaderComponent={
          <>
            {/* HEADER */}

            <View style={styles.header}>
              <View>
                <Text style={styles.pageTitle}>Admin Dashboard</Text>

                <Text style={styles.pageSubtitle}>Quản lý người dùng</Text>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>

            {/* FORM */}

            <View style={styles.form}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {editingId ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                </Text>

                {editingId && (
                  <TouchableOpacity onPress={resetForm}>
                    <Text style={styles.cancelText}>Hủy</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#94a3b8"
                value={matkhau}
                onChangeText={setMatkhau}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Họ tên"
                placeholderTextColor="#94a3b8"
                value={hoten}
                onChangeText={setHoten}
              />

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>
                  {imageUri || currentImageUrl
                    ? "Chọn ảnh khác"
                    : "Chọn hình ảnh"}
                </Text>
              </TouchableOpacity>

              {(imageUri || currentImageUrl) && (
                <Image
                  source={{
                    uri: imageUri || currentImageUrl || "",
                  }}
                  style={styles.previewImage}
                />
              )}

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingId ? "Cập nhật người dùng" : "Thêm người dùng"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* LIST HEADER */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách người dùng</Text>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>{users.length}</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          fetching ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Chưa có người dùng</Text>

              <Text style={styles.emptyText}>
                Hãy thêm người dùng đầu tiên.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#f1f5f9",
  },

  content: {
    width: "100%",

    maxWidth: 1100,

    alignSelf: "center",

    paddingHorizontal: 20,

    paddingTop: 24,

    paddingBottom: 60,
  },

  // HEADER

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    backgroundColor: "#ffffff",

    padding: 20,

    borderRadius: 16,

    marginBottom: 20,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,

    shadowRadius: 8,

    elevation: 2,
  },

  pageTitle: {
    fontSize: 24,

    fontWeight: "800",

    color: "#0f172a",
  },

  pageSubtitle: {
    marginTop: 4,

    fontSize: 14,

    color: "#64748b",
  },

  logoutButton: {
    backgroundColor: "#0f172a",

    paddingVertical: 10,

    paddingHorizontal: 16,

    borderRadius: 9,
  },

  logoutText: {
    color: "#ffffff",

    fontWeight: "600",
  },

  // FORM

  form: {
    backgroundColor: "#ffffff",

    borderRadius: 16,

    padding: 22,

    marginBottom: 28,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,

    shadowRadius: 8,

    elevation: 2,
  },

  formHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 18,
  },

  formTitle: {
    fontSize: 19,

    fontWeight: "700",

    color: "#0f172a",
  },

  cancelText: {
    color: "#ef4444",

    fontWeight: "600",
  },

  input: {
    height: 48,

    borderWidth: 1,

    borderColor: "#e2e8f0",

    borderRadius: 10,

    paddingHorizontal: 14,

    backgroundColor: "#f8fafc",

    marginBottom: 12,

    fontSize: 15,

    color: "#0f172a",
  },

  imageButton: {
    height: 48,

    borderWidth: 1,

    borderColor: "#2563eb",

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 14,
  },

  imageButtonText: {
    color: "#2563eb",

    fontWeight: "600",
  },

  previewImage: {
    width: 100,

    height: 100,

    borderRadius: 50,

    alignSelf: "center",

    marginBottom: 15,

    resizeMode: "cover",
  },

  saveButton: {
    height: 48,

    backgroundColor: "#2563eb",

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",
  },

  saveButtonText: {
    color: "#ffffff",

    fontWeight: "700",

    fontSize: 15,
  },

  disabledButton: {
    opacity: 0.6,
  },

  // SECTION

  sectionHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#0f172a",

    marginRight: 10,
  },

  countBadge: {
    backgroundColor: "#dbeafe",

    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: 20,
  },

  countText: {
    color: "#2563eb",

    fontWeight: "700",
  },

  // USER CARD

  userCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#ffffff",

    borderRadius: 14,

    padding: 16,

    marginBottom: 12,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,

    shadowRadius: 6,

    elevation: 2,
  },

  userCardMobile: {
    flexDirection: "column",

    alignItems: "stretch",
  },

  userImage: {
    width: 64,

    height: 64,

    borderRadius: 32,

    marginRight: 16,

    resizeMode: "cover",
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 17,

    fontWeight: "700",

    color: "#0f172a",

    marginBottom: 4,
  },

  userInfo: {
    fontSize: 14,

    color: "#475569",

    marginBottom: 4,
  },

  passwordText: {
    fontSize: 13,

    color: "#94a3b8",
  },

  // ACTIONS

  actions: {
    flexDirection: "row",

    gap: 8,

    marginLeft: 12,
  },

  actionsMobile: {
    marginLeft: 0,

    marginTop: 14,

    width: "100%",
  },

  editButton: {
    backgroundColor: "#f59e0b",

    paddingVertical: 10,

    paddingHorizontal: 18,

    borderRadius: 8,
  },

  deleteButton: {
    backgroundColor: "#ef4444",

    paddingVertical: 10,

    paddingHorizontal: 18,

    borderRadius: 8,
  },

  actionText: {
    color: "#ffffff",

    fontWeight: "600",
  },

  // EMPTY

  emptyBox: {
    backgroundColor: "#ffffff",

    padding: 30,

    borderRadius: 14,

    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 17,

    fontWeight: "700",

    color: "#334155",
  },

  emptyText: {
    fontSize: 14,

    color: "#94a3b8",

    marginTop: 5,
  },

  // LOADING

  centerScreen: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#f1f5f9",
  },

  loadingText: {
    marginTop: 10,

    color: "#64748b",
  },
});
