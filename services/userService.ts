import { db } from "../firebaseConfig";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import type { User, UserInput } from "../src/types/user";

const usersRef = collection(db, "users");

export const addUser = async (user: UserInput): Promise<string> => {
  const docRef = await addDoc(usersRef, user);

  return docRef.id;
};

export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as User[];
};

export const updateUser = async (
  id: string,
  user: Partial<UserInput>,
): Promise<void> => {
  const userRef = doc(db, "users", id);

  await updateDoc(userRef, user);
};

export const deleteUser = async (id: string): Promise<void> => {
  const userRef = doc(db, "users", id);

  await deleteDoc(userRef);
};
