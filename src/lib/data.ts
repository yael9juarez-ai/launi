
export const CATEGORIES = ["Platos Principales", "Snacks", "Bebidas", "Postres"];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Pizza Pepperoni",
    description: "Masa artesanal con salsa de tomate y queso mozzarella.",
    price: 3.50,
    category: "Snacks",
    imageUrl: "https://picsum.photos/seed/pizza/400/300",
    stock: 20,
  },
  {
    id: "2",
    name: "Ensalada César",
    description: "Lechuga fresca, crotones, queso parmesano y aderezo.",
    price: 4.50,
    category: "Platos Principales",
    imageUrl: "https://picsum.photos/seed/salad/400/300",
    stock: 15,
  },
  {
    id: "3",
    name: "Café Americano",
    description: "Grano seleccionado de altura.",
    price: 1.20,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/coffee/400/300",
    stock: 100,
  },
  {
    id: "4",
    name: "Hamburguesa Especial",
    description: "Carne de res, queso, tocino y papas fritas.",
    price: 5.00,
    category: "Platos Principales",
    imageUrl: "https://picsum.photos/seed/burger/400/300",
    stock: 12,
  },
  {
    id: "5",
    name: "Pasta Pesto",
    description: "Pasta al dente con salsa de albahaca y nueces.",
    price: 4.80,
    category: "Platos Principales",
    imageUrl: "https://picsum.photos/seed/pasta/400/300",
    stock: 8,
  },
  {
    id: "6",
    name: "Muffin de Arándanos",
    description: "Esponjoso pan dulce con arándanos frescos.",
    price: 1.50,
    category: "Postres",
    imageUrl: "https://picsum.photos/seed/muffin/400/300",
    stock: 25,
  }
];

export const SALES_RECORDS = [
  {
    transactionId: "T1",
    timestamp: "2024-05-10T08:30:00Z",
    items: [{ itemId: "3", itemName: "Café Americano", quantity: 2, price: 1.20 }],
    totalAmount: 2.40,
  },
  {
    transactionId: "T2",
    timestamp: "2024-05-10T12:45:00Z",
    items: [{ itemId: "4", itemName: "Hamburguesa Especial", quantity: 1, price: 5.00 }],
    totalAmount: 5.00,
  },
  {
    transactionId: "T3",
    timestamp: "2024-05-10T13:00:00Z",
    items: [{ itemId: "2", itemName: "Ensalada César", quantity: 1, price: 4.50 }],
    totalAmount: 4.50,
  }
];

export const INVENTORY = [
  { ingredientId: "i1", ingredientName: "Harina", currentStock: 50, unit: "kg", minStockLevel: 10 },
  { ingredientId: "i2", ingredientName: "Tomate", currentStock: 5, unit: "kg", minStockLevel: 8 },
  { ingredientId: "i3", ingredientName: "Café en grano", currentStock: 15, unit: "kg", minStockLevel: 5 },
  { ingredientId: "i4", ingredientName: "Queso Mozzarella", currentStock: 12, unit: "kg", minStockLevel: 5 },
];
