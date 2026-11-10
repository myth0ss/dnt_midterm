import { Platform } from "react-native";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";

export interface CloudinaryUploadResult {
  imageUrl: string;
  imagePublicId: string;
}

const CLOUD_NAME = "h8dq3hou";
const UPLOAD_PRESET = "product_upload";

export const uploadImage = async (
  imageUri: string,
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();

  // ============================
  // WEB
  // ============================
  if (Platform.OS === "web") {
    const imageResponse = await globalThis.fetch(imageUri);

    const blob = await imageResponse.blob();

    formData.append("file", blob, `user_${Date.now()}.jpg`);
  }

  // ============================
  // ANDROID / IOS
  // ============================
  else {
    const file = new File(imageUri);

    formData.append("file", file);
  }

  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const response =
    Platform.OS === "web"
      ? await globalThis.fetch(url, {
          method: "POST",
          body: formData,
        })
      : await expoFetch(url, {
          method: "POST",
          body: formData,
        });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message || "Không thể upload ảnh lên Cloudinary",
    );
  }

  if (!result.secure_url) {
    throw new Error("Cloudinary không trả về URL ảnh");
  }

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
  };
};
