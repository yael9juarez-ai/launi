export const CATEGORIES = ["Comida", "Bebidas", "Golosinas"];

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: 'pzas' | 'gr' | 'ml' | 'rebanadas' | 'cucharadas' | 'cucharaditas';
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

// INVENTARIO DE INSUMOS (ALMACÉN CENTRAL)
export const INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Pan de Hamburguesa", stock: 100, unit: "pzas", minStock: 20 },
  { id: "i2", name: "Carne de Res Molida", stock: 20000, unit: "gr", minStock: 5000 },
  { id: "i3", name: "Queso Amarillo", stock: 200, unit: "rebanadas", minStock: 40 },
  { id: "i7", name: "Sopa Maruchan (Vaso)", stock: 80, unit: "pzas", minStock: 15 },
  { id: "i8", name: "Coca Cola 600ml", stock: 120, unit: "pzas", minStock: 24 },
  { id: "i9", name: "Agua Bonafont 600ml", stock: 150, unit: "pzas", minStock: 24 },
  { id: "i13", name: "Gomitas Varias (Stock)", stock: 50000, unit: "gr", minStock: 5000 },
  { id: "i14", name: "Botella Agua Jamaica", stock: 60, unit: "pzas", minStock: 12 },
  { id: "i15", name: "Botella Agua Horchata", stock: 60, unit: "pzas", minStock: 12 },
  { id: "i16", name: "Botella Agua Limón", stock: 60, unit: "pzas", minStock: 12 },
  { id: "i24", name: "Harina de Trigo", stock: 25000, unit: "gr", minStock: 2000 },
  { id: "i31", name: "Azúcar Blanca", stock: 15000, unit: "gr", minStock: 1000 },
  { id: "i27", name: "Mantequilla Sin Sal", stock: 8000, unit: "gr", minStock: 500 },
  { id: "i26", name: "Huevo Fresco", stock: 300, unit: "pzas", minStock: 24 },
  { id: "i25", name: "Leche Entera", stock: 30000, unit: "ml", minStock: 3000 },
  { id: "i32", name: "Polvo para Hornear", stock: 2000, unit: "gr", minStock: 100 },
  { id: "i33", name: "Extracto de Vainilla", stock: 2000, unit: "ml", minStock: 50 },
  { id: "i30", name: "Pan de Dulce (La Esperanza)", stock: 150, unit: "pzas", minStock: 10 },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Sopa Maruchan Preparada",
    description: "Sopa instantánea con salsa, limón y agua caliente.",
    price: 35.00,
    category: "Comida",
    imageUrl: "/images/marucha.jpg",
    recipe: [
      { ingredientId: "i7", quantity: 1 },
      { ingredientId: "i9", quantity: 1 }
    ],
    nutrition: { calories: 300, protein: 5, fat: 12, carbs: 45 }
  },
  {
    id: "m2",
    name: "Hamburguesa con Queso",
    description: "Carne de res, queso amarillo, lechuga y tomate.",
    price: 95.00,
    category: "Comida",
    imageUrl: "/images/hamburguesa.png",
    recipe: [
      { ingredientId: "i1", quantity: 1 },
      { ingredientId: "i2", quantity: 150 },
      { ingredientId: "i3", quantity: 1 }
    ],
    nutrition: { calories: 580, protein: 28, fat: 32, carbs: 42 }
  },
  {
    id: "m7",
    name: "Hot Cakes Caseros (Orden 3)",
    description: "Harina, azúcar, mantequilla, huevos, leche, polvo hornear y vainilla.",
    price: 65.00,
    category: "Comida",
    imageUrl: "/images/hotcakes.jpg",
    recipe: [
      { ingredientId: "i24", quantity: 250 },
      { ingredientId: "i31", quantity: 125 },
      { ingredientId: "i27", quantity: 60 },
      { ingredientId: "i26", quantity: 3 },
      { ingredientId: "i25", quantity: 240 },
      { ingredientId: "i32", quantity: 10 },
      { ingredientId: "i33", quantity: 5 }
    ],
    nutrition: { calories: 550, protein: 15, fat: 22, carbs: 75 }
  },
  {
    id: "m9",
    name: "Pan de Dulce (La Esperanza)",
    description: "Pieza de pan dulce fresco de recompra.",
    price: 30.00,
    category: "Golosinas",
    imageUrl: "/images/dona.png",
    recipe: [{ ingredientId: "i30", quantity: 1 }],
    nutrition: { calories: 280, protein: 4, fat: 12, carbs: 38 }
  },
  {
    id: "g1",
    name: "Gomitas Pinguino (150g)",
    description: "Deliciosas gomitas en forma de pingüino.",
    price: 30.00,
    category: "Golosinas",
    imageUrl: "/images/gomitas-pinguino.jpg",
    recipe: [{ ingredientId: "i13", quantity: 150 }],
    nutrition: { calories: 480, protein: 3, fat: 0, carbs: 115 }
  },
  {
    id: "b1",
    name: "Agua Bonafont (600ml)",
    description: "Botella fría de agua natural purificada.",
    price: 20.00,
    category: "Bebidas",
    imageUrl: "/images/bonafont.jpg",
    recipe: [{ ingredientId: "i9", quantity: 1 }],
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  {
    id: "b5",
    name: "Agua de Jamaica (600ml)",
    description: "Botella de agua fresca de jamaica.",
    price: 35.00,
    category: "Bebidas",
    imageUrl: "/images/agua-jamaica.jpg",
    recipe: [{ ingredientId: "i14", quantity: 1 }],
    nutrition: { calories: 180, protein: 0, fat: 0, carbs: 45 }
  },
  {
    id: "b6",
    name: "Coca-Cola (600ml)",
    description: "Refresco de cola clásico, botella de plástico.",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "/images/cocacola.png",
    recipe: [{ ingredientId: "i8", quantity: 1 }],
    nutrition: { calories: 240, protein: 0, fat: 0, carbs: 65 }
  }
];

export const SALES_RECORDS = [
  {
    transactionId: "T-START",
    timestamp: new Date().toISOString(),
    items: [{ itemId: "m2", itemName: "Hamburguesa con Queso", quantity: 1, price: 95.00 }],
    totalAmount: 95.00,
  }
];