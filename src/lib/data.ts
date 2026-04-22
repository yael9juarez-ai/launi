
export const CATEGORIES = ["Platos Principales", "Snacks", "Bebidas", "Postres"];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Pizza Pepperoni",
    description: "Masa artesanal con salsa de tomate y queso mozzarella premium.",
    price: 45.00,
    category: "Snacks",
    imageUrl: "https://picsum.photos/seed/pizza/400/300",
    stock: 20,
    nutrition: { calories: 285, protein: 12, fat: 10, carbs: 36 }
  },
  {
    id: "2",
    name: "Ensalada César",
    description: "Lechuga fresca, crotones, queso parmesano y aderezo de la casa.",
    price: 75.00,
    category: "Platos Principales",
    imageUrl: "https://picsum.photos/seed/salad/400/300",
    stock: 15,
    nutrition: { calories: 190, protein: 8, fat: 14, carbs: 10 }
  },
  {
    id: "3",
    name: "Café Americano",
    description: "Grano seleccionado de altura, tostado artesanal.",
    price: 35.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/coffee/400/300",
    stock: 100,
    nutrition: { calories: 2, protein: 0.2, fat: 0, carbs: 0 }
  },
  {
    id: "4",
    name: "Hamburguesa Especial",
    description: "Carne de res premium, queso, tocino y papas a la francesa.",
    price: 110.00,
    category: "Platos Principales",
    imageUrl: "https://picsum.photos/seed/burger/400/300",
    stock: 12,
    nutrition: { calories: 550, protein: 25, fat: 30, carbs: 45 }
  },
  {
    id: "5",
    name: "Pasta Pesto",
    description: "Pasta al dente con salsa de albahaca fresca y nueces.",
    price: 95.00,
    category: "Platos Principales",
    imageUrl: "https://picsum.photos/seed/pasta/400/300",
    stock: 8,
    nutrition: { calories: 420, protein: 10, fat: 18, carbs: 55 }
  },
  {
    id: "6",
    name: "Muffin de Arándanos",
    description: "Esponjoso pan dulce con arándanos frescos orgánicos.",
    price: 32.00,
    category: "Postres",
    imageUrl: "https://picsum.photos/seed/muffin/400/300",
    stock: 25,
    nutrition: { calories: 310, protein: 4, fat: 12, carbs: 48 }
  }
];

export const SALES_RECORDS = [
  {
    transactionId: "T1",
    timestamp: "2024-05-10T08:30:00Z",
    items: [{ itemId: "3", itemName: "Café Americano", quantity: 2, price: 35.00 }],
    totalAmount: 70.00,
  },
  {
    transactionId: "T2",
    timestamp: "2024-05-10T12:45:00Z",
    items: [{ itemId: "4", itemName: "Hamburguesa Especial", quantity: 1, price: 110.00 }],
    totalAmount: 110.00,
  },
  {
    transactionId: "T3",
    timestamp: "2024-05-10T13:00:00Z",
    items: [{ itemId: "2", itemName: "Ensalada César", quantity: 1, price: 75.00 }],
    totalAmount: 75.00,
  }
];

export const INVENTORY = [
  { ingredientId: "i1", ingredientName: "Harina", currentStock: 50, unit: "kg", minStockLevel: 10 },
  { ingredientId: "i2", ingredientName: "Tomate", currentStock: 5, unit: "kg", minStockLevel: 8 },
  { ingredientId: "i3", ingredientName: "Café en grano", currentStock: 15, unit: "kg", minStockLevel: 5 },
  { ingredientId: "i4", ingredientName: "Queso Mozzarella", currentStock: 12, unit: "kg", minStockLevel: 5 },
];
