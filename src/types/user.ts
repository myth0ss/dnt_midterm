export interface User {
  id: string;
  email: string;
  matkhau: string;
  hoten: string;
  hinhanh: string;
}

export type UserInput = Omit<User, "id">;
