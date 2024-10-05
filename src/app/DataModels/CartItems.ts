export interface cartItems {
  id: string
  name: string;
  category: string;
  price: number;
  description: string;
  stockQuantity: number;
  imageUrl: string[];
  productQuantity: number;
  isInIteminCart: boolean;
  userId: string
}
