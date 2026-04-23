
export const CATEGORIES = ["Comida", "Bebidas"];

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
  // COMIDA
  {
    id: "m1",
    name: "Maruchan Preparada",
    description: "Sopa instantánea con salsa, limón y especias.",
    price: 25.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/maruchan/400/300",
    stock: 50,
    nutrition: { calories: 300, protein: 5, fat: 12, carbs: 45 }
  },
  {
    id: "m2",
    name: "Hamburguesa Clásica",
    description: "Carne de res premium con queso, lechuga y tomate.",
    price: 85.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/burger-mex/400/300",
    stock: 20,
    nutrition: { calories: 550, protein: 25, fat: 30, carbs: 40 }
  },
  {
    id: "m3",
    name: "Papas a la Francesa",
    description: "Papas crujientes con sal y aderezo catsup.",
    price: 35.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/french-fries/400/300",
    stock: 40,
    nutrition: { calories: 320, protein: 3, fat: 15, carbs: 42 }
  },
  {
    id: "m4",
    name: "Sincronizadas",
    description: "Tortillas de harina con jamón y queso derretido.",
    price: 65.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/quesadilla/400/300",
    stock: 30,
    nutrition: { calories: 450, protein: 18, fat: 22, carbs: 35 }
  },
  {
    id: "m5",
    name: "Orden de Tacos (3)",
    description: "Tacos de guisado variado con guarnición de verdura.",
    price: 75.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/mexican-tacos/400/300",
    stock: 25,
    nutrition: { calories: 480, protein: 20, fat: 18, carbs: 45 }
  },
  {
    id: "m6",
    name: "Rollos de Sushi",
    description: "Rollos california con surimi, pepino y aguacate.",
    price: 95.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/sushi-rolls/400/300",
    stock: 15,
    nutrition: { calories: 350, protein: 10, fat: 8, carbs: 60 }
  },
  // BEBIDAS
  {
    id: "b1",
    name: "Aguas de Sabor",
    description: "Agua fresca natural del día (Jamaica o Horchata).",
    price: 20.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/fresh-water/400/300",
    stock: 60,
    nutrition: { calories: 80, protein: 0, fat: 0, carbs: 20 }
  },
  {
    id: "b2",
    name: "Coca Cola",
    description: "Refresco de cola clásico original 600ml.",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/cola-bottle/400/300",
    stock: 100,
    nutrition: { calories: 210, protein: 0, fat: 0, carbs: 54 }
  },
  {
    id: "b3",
    name: "Agua Natural",
    description: "Botella de agua purificada 500ml.",
    price: 15.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/water-bottle/400/300",
    stock: 120,
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  {
    id: "b4",
    name: "Leche de Chocolate",
    description: "Bebida láctea sabor chocolate enriquecida.",
    price: 22.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/chocolate-milk/400/300",
    stock: 45,
    nutrition: { calories: 180, protein: 8, fat: 5, carbs: 25 }
  }
];

export const SALES_RECORDS = [
  {
    transactionId: "T1",
    timestamp: new Date().toISOString(),
    items: [{ itemId: "b2", itemName: "Coca Cola", quantity: 2, price: 25.00 }],
    totalAmount: 50.00,
  }
];
