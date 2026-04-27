
export const CATEGORIES = ["Comida", "Bebidas", "Golosinas"];

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: 'pzas' | 'gr' | 'ml' | 'rebanadas';
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
// Los valores de stock siempre se guardan en la unidad base (ml, gr, pzas)
export const INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Pan de Hamburguesa", stock: 50, unit: "pzas", minStock: 10 },
  { id: "i2", name: "Carne de Res Molida", stock: 10000, unit: "gr", minStock: 2000 },
  { id: "i3", name: "Queso Amarillo", stock: 100, unit: "rebanadas", minStock: 20 },
  { id: "i4", name: "Jamón de Pavo", stock: 80, unit: "rebanadas", minStock: 15 },
  { id: "i5", name: "Tortilla de Harina", stock: 120, unit: "pzas", minStock: 30 },
  { id: "i6", name: "Tortilla de Maíz", stock: 300, unit: "pzas", minStock: 50 },
  { id: "i7", name: "Sopa Maruchan (Vaso)", stock: 60, unit: "pzas", minStock: 10 },
  { id: "i8", name: "Refresco 600ml (Botella)", stock: 100, unit: "pzas", minStock: 20 },
  { id: "i9", name: "Agua Purificada (Garrafón)", stock: 100000, unit: "ml", minStock: 10000 },
  { id: "i13", name: "Gomitas Varias", stock: 15000, unit: "gr", minStock: 2000 },
  { id: "i14", name: "Concentrado Jamaica", stock: 5000, unit: "ml", minStock: 500 },
  { id: "i15", name: "Concentrado Limón", stock: 5000, unit: "ml", minStock: 500 },
  { id: "i18", name: "Aceite Vegetal", stock: 5000, unit: "ml", minStock: 500 },
  { id: "i19", name: "Lechuga Fresca", stock: 2000, unit: "gr", minStock: 500 },
  { id: "i20", name: "Tomate Rojo", stock: 3000, unit: "gr", minStock: 500 },
  { id: "i21", name: "Cebolla Blanca", stock: 2000, unit: "gr", minStock: 300 },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Maruchan Preparada",
    description: "Sopa instantánea con salsa, limón y especias.",
    price: 25.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/maruchan/400/300",
    recipe: [
      { ingredientId: "i7", quantity: 1 },
      { ingredientId: "i9", quantity: 300 } // 300ml de agua caliente
    ],
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
      { ingredientId: "i1", quantity: 1 },    // 1 pan
      { ingredientId: "i2", quantity: 150 },  // 150g de carne
      { ingredientId: "i3", quantity: 1 },    // 1 rebanada queso
      { ingredientId: "i19", quantity: 20 },  // 20g lechuga
      { ingredientId: "i20", quantity: 30 },  // 30g tomate
      { ingredientId: "i18", quantity: 10 }   // 10ml aceite para cocinar
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
      { ingredientId: "i3", quantity: 2 },
      { ingredientId: "i18", quantity: 5 } // 5ml aceite
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
    recipe: [
      { ingredientId: "i6", quantity: 3 },
      { ingredientId: "i2", quantity: 120 }, // 120g de carne de guisado
      { ingredientId: "i18", quantity: 10 }
    ],
    nutrition: { calories: 480, protein: 20, fat: 18, carbs: 45 }
  },
  {
    id: "d1",
    name: "Gomitas Variadas (100g)",
    description: "Bolsa de 100 gramos de gomitas mixtas.",
    price: 20.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/gummies/400/300",
    recipe: [{ ingredientId: "i13", quantity: 100 }],
    nutrition: { calories: 320, protein: 2, fat: 0, carbs: 78 }
  },
  {
    id: "b3",
    name: "Agua Natural 500ml",
    description: "Vaso de agua purificada 500ml.",
    price: 15.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/water-bottle/400/300",
    recipe: [{ ingredientId: "i9", quantity: 500 }],
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  {
    id: "b5",
    name: "Agua de Jamaica",
    description: "Agua fresca natural de Jamaica (Vaso grande).",
    price: 25.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/jamaica/400/300",
    recipe: [
      { ingredientId: "i9", quantity: 500 }, 
      { ingredientId: "i14", quantity: 50 }
    ],
    nutrition: { calories: 120, protein: 0, fat: 0, carbs: 30 }
  },
  {
    id: "b2",
    name: "Coca Cola 600ml",
    description: "Refresco de cola clásico original botella.",
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
    items: [{ itemId: "b2", itemName: "Coca Cola 600ml", quantity: 2, price: 25.00 }],
    totalAmount: 50.00,
  }
];
