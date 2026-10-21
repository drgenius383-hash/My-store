export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
};

export type OrderStatus = 'pending' | 'approved' | 'disapproved';

export type Order = {
  id: string;
  user_id: string;
  products: OrderItem[];
  total: number;
  receipt_url: string;
  status: OrderStatus;
  created_at: string;
};

export type AdminOrder = Order & {
  profiles: Pick<Profile, 'full_name' | 'phone' | 'email' | 'address'> | null;
};
