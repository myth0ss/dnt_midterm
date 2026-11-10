export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;

  imageUrl?: string;
  imagePublicId?: string;
}

export type ProductInput = Omit<Product, "id">;
