
export const CATEGORIES = ["Comida", "Bebidas"];

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  recipe: RecipeItem[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

// INVENTARIO DE INSUMOS (MATERIA PRIMA)
export const INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Pan de Hamburguesa", stock: 50, unit: "pzas", minStock: 10 },
  { id: "i2", name: "Carne de Res (150g)", stock: 45, unit: "pzas", minStock: 10 },
  { id: "i3", name: "Queso Amarillo", stock: 100, unit: "rebanadas", minStock: 20 },
  { id: "i4", name: "Jamón de Pavo", stock: 80, unit: "rebanadas", minStock: 15 },
  { id: "i5", name: "Tortilla de Harina", stock: 120, unit: "pzas", minStock: 30 },
  { id: "i6", name: "Tortilla de Maíz", stock: 300, unit: "pzas", minStock: 50 },
  { id: "i7", name: "Sopa Maruchan (Vaso)", stock: 60, unit: "pzas", minStock: 10 },
  { id: "i8", name: "Refresco 600ml", stock: 100, unit: "botellas", minStock: 20 },
  { id: "i9", name: "Agua 500ml", stock: 150, unit: "botellas", minStock: 20 },
  { id: "i10", name: "Leche sabor Choco", stock: 40, unit: "pzas", minStock: 10 },
  { id: "i11", name: "Arroz Sushi", stock: 5000, unit: "gr", minStock: 1000 },
  { id: "i12", name: "Alga Nori", stock: 100, unit: "pzas", minStock: 20 },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Maruchan Preparada",
    description: "Sopa instantánea con salsa, limón y especias.",
    price: 25.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/maruchan/400/300",
    recipe: [{ ingredientId: "i7", quantity: 1 }],
    nutrition: { calories: 300, protein: 5, fat: 12, carbs: 45 }
  },
  {
    id: "m2",
    name: "Hamburguesa Clásica",
    description: "Carne de res premium con queso, lechuga y tomate.",
    price: 85.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/burger-mex/400/300",
    recipe: [
      { ingredientId: "i1", quantity: 1 },
      { ingredientId: "i2", quantity: 1 },
      { ingredientId: "i3", quantity: 1 }
    ],
    nutrition: { calories: 550, protein: 25, fat: 30, carbs: 40 }
  },
  {
    id: "m4",
    name: "Sincronizadas",
    description: "Tortillas de harina con jamón y queso derretido.",
    price: 65.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/quesadilla/400/300",
    recipe: [
      { ingredientId: "i5", quantity: 2 },
      { ingredientId: "i4", quantity: 2 },
      { ingredientId: "i3", quantity: 2 }
    ],
    nutrition: { calories: 450, protein: 18, fat: 22, carbs: 35 }
  },
  {
    id: "m5",
    name: "Orden de Tacos (3)",
    description: "Tacos de guisado variado.",
    price: 75.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/mexican-tacos/400/300",
    recipe: [{ ingredientId: "i6", quantity: 3 }],
    nutrition: { calories: 480, protein: 20, fat: 18, carbs: 45 }
  },
  {
    id: "b2",
    name: "Coca Cola",
    description: "Refresco de cola clásico original 600ml.",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/cola-bottle/400/300",
    recipe: [{ ingredientId: "i8", quantity: 1 }],
    nutrition: { calories: 210, protein: 0, fat: 0, carbs: 54 }
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
