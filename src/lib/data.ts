
export const CATEGORIES = ["Comida", "Bebidas", "Golosinas"];

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
  { id: "i9", name: "Agua Purificada (ml)", stock: 50000, unit: "ml", minStock: 5000 },
  { id: "i10", name: "Leche sabor Choco", stock: 40, unit: "pzas", minStock: 10 },
  { id: "i11", name: "Arroz Sushi", stock: 5000, unit: "gr", minStock: 1000 },
  { id: "i12", name: "Alga Nori", stock: 100, unit: "pzas", minStock: 20 },
  { id: "i13", name: "Gomitas Varias (gr)", stock: 10000, unit: "gr", minStock: 1000 },
  { id: "i14", name: "Concentrado Jamaica", stock: 5000, unit: "ml", minStock: 500 },
  { id: "i15", name: "Concentrado Limón", stock: 5000, unit: "ml", minStock: 500 },
  { id: "i16", name: "Concentrado Maracuyá", stock: 5000, unit: "ml", minStock: 500 },
  { id: "i17", name: "Concentrado Nuez", stock: 5000, unit: "ml", minStock: 500 },
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
    id: "d1",
    name: "Gomitas Dientes (100g)",
    description: "100 gramos de gomitas en forma de dientes.",
    price: 20.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/gummy-teeth/400/300",
    recipe: [{ ingredientId: "i13", quantity: 100 }],
    nutrition: { calories: 320, protein: 2, fat: 0, carbs: 78 }
  },
  {
    id: "d2",
    name: "Gomitas Aciditos (100g)",
    description: "100 gramos de gomitas con toque ácido.",
    price: 20.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/gummy-sour/400/300",
    recipe: [{ ingredientId: "i13", quantity: 100 }],
    nutrition: { calories: 320, protein: 2, fat: 0, carbs: 78 }
  },
  {
    id: "d3",
    name: "Gomitas Pinguino (100g)",
    description: "100 gramos de gomitas forma pinguino.",
    price: 20.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/gummy-penguin/400/300",
    recipe: [{ ingredientId: "i13", quantity: 100 }],
    nutrition: { calories: 320, protein: 2, fat: 0, carbs: 78 }
  },
  {
    id: "d4",
    name: "Gomitas Picosas (100g)",
    description: "100 gramos de gomitas con chile picosito.",
    price: 20.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/gummy-spicy/400/300",
    recipe: [{ ingredientId: "i13", quantity: 100 }],
    nutrition: { calories: 330, protein: 2, fat: 0, carbs: 80 }
  },
  {
    id: "b3",
    name: "Agua Natural 500ml",
    description: "Botella de agua purificada 500ml.",
    price: 15.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/water-500/400/300",
    recipe: [{ ingredientId: "i9", quantity: 500 }],
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  {
    id: "b4",
    name: "Litro de Agua",
    description: "Botella de agua purificada 1000ml.",
    price: 20.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/water-1000/400/300",
    recipe: [{ ingredientId: "i9", quantity: 1000 }],
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  {
    id: "b5",
    name: "Agua de Jamaica",
    description: "Agua fresca natural de Jamaica (Vaso grande).",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/jamaica/400/300",
    recipe: [{ ingredientId: "i9", quantity: 500 }, { ingredientId: "i14", quantity: 50 }],
    nutrition: { calories: 120, protein: 0, fat: 0, carbs: 30 }
  },
  {
    id: "b6",
    name: "Agua de Limón",
    description: "Agua fresca natural de Limón (Vaso grande).",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/lemon-water/400/300",
    recipe: [{ ingredientId: "i9", quantity: 500 }, { ingredientId: "i15", quantity: 50 }],
    nutrition: { calories: 110, protein: 0, fat: 0, carbs: 28 }
  },
  {
    id: "b7",
    name: "Agua de Maracuya",
    description: "Agua fresca natural de Maracuya (Vaso grande).",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/passion-fruit/400/300",
    recipe: [{ ingredientId: "i9", quantity: 500 }, { ingredientId: "i16", quantity: 50 }],
    nutrition: { calories: 130, protein: 0, fat: 0, carbs: 32 }
  },
  {
    id: "b8",
    name: "Agua de Nuez",
    description: "Agua fresca cremosa de Nuez (Vaso grande).",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/nut-water/400/300",
    recipe: [{ ingredientId: "i9", quantity: 500 }, { ingredientId: "i17", quantity: 50 }],
    nutrition: { calories: 180, protein: 2, fat: 5, carbs: 25 }
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
