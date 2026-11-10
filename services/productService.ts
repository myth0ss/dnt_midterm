import { db } from "../firebaseConfig";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import type { Product, ProductInput } from "../src/types/product";

const COLLECTION_NAME = "products";

const productsRef = collection(db, COLLECTION_NAME);

// CREATE - Thêm sản phẩm
export const addProduct = async (product: ProductInput): Promise<string> => {
  const docRef = await addDoc(productsRef, {
    ...product,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// READ - Lấy danh sách sản phẩm
export const getProducts = async (): Promise<Product[]> => {
  const q = query(productsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    ...document.data(),
    id: document.id,
  })) as Product[];
};

// UPDATE - Cập nhật sản phẩm
export const updateProduct = async (
  id: string,
  product: Partial<ProductInput>,
): Promise<void> => {
  const productRef = doc(db, COLLECTION_NAME, id);

  await updateDoc(productRef, {
    ...product,
    updatedAt: serverTimestamp(),
  });
};

// DELETE - Xóa sản phẩm
export const deleteProduct = async (id: string): Promise<void> => {
  const productRef = doc(db, COLLECTION_NAME, id);

  await deleteDoc(productRef);
};
