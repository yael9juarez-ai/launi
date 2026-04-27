
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

// INVENTARIO DE INSUMOS (ALMACÉN CENTRAL)
export const INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Pan de Hamburguesa", stock: 100, unit: "pzas", minStock: 20 },
  { id: "i2", name: "Carne de Res Molida", stock: 20000, unit: "gr", minStock: 5000 },
  { id: "i3", name: "Queso Amarillo", stock: 200, unit: "rebanadas", minStock: 40 },
  { id: "i4", name: "Jamón de Pavo", stock: 150, unit: "rebanadas", minStock: 30 },
  { id: "i5", name: "Tortilla de Harina", stock: 200, unit: "pzas", minStock: 50 },
  { id: "i6", name: "Tortilla de Maíz", stock: 500, unit: "pzas", minStock: 100 },
  { id: "i7", name: "Sopa Maruchan (Vaso)", stock: 80, unit: "pzas", minStock: 15 },
  { id: "i8", name: "Refresco 600ml (Botella)", stock: 120, unit: "pzas", minStock: 24 },
  { id: "i9", name: "Agua Bonafont (600ml)", stock: 150, unit: "pzas", minStock: 24 },
  { id: "i13", name: "Gomitas Varias (Stock)", stock: 50000, unit: "gr", minStock: 5000 },
  { id: "i14", name: "Botella Agua Jamaica", stock: 60, unit: "pzas", minStock: 12 },
  { id: "i15", name: "Botella Agua Horchata", stock: 60, unit: "pzas", minStock: 12 },
  { id: "i16", name: "Botella Agua Limón", stock: 60, unit: "pzas", minStock: 12 },
  { id: "i18", name: "Aceite Vegetal", stock: 10000, unit: "ml", minStock: 2000 },
  { id: "i19", name: "Lechuga Fresca", stock: 5000, unit: "gr", minStock: 1000 },
  { id: "i20", name: "Tomate Rojo", stock: 8000, unit: "gr", minStock: 1000 },
  { id: "i21", name: "Cebolla Blanca", stock: 5000, unit: "gr", minStock: 1000 },
  { id: "i23", name: "Sal Refinada", stock: 5000, unit: "gr", minStock: 500 },
  { id: "i24", name: "Harina de Trigo", stock: 25000, unit: "gr", minStock: 2000 },
  { id: "i25", name: "Leche Entera", stock: 30000, unit: "ml", minStock: 3000 },
  { id: "i26", name: "Huevo Fresco", stock: 300, unit: "pzas", minStock: 24 },
  { id: "i27", name: "Mantequilla Sin Sal", stock: 8000, unit: "gr", minStock: 500 },
  { id: "i31", name: "Azúcar Blanca", stock: 15000, unit: "gr", minStock: 1000 },
  { id: "i32", name: "Polvo para Hornear", stock: 2000, unit: "gr", minStock: 100 },
  { id: "i33", name: "Extracto de Vainilla", stock: 2000, unit: "ml", minStock: 50 },
  { id: "i30", name: "Pan de Dulce (La Esperanza)", stock: 150, unit: "pzas", minStock: 10 },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Maruchan Preparada",
    description: "Sopa instantánea con salsa, limón y agua caliente.",
    price: 35.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/maruchan/400/300",
    recipe: [
      { ingredientId: "i7", quantity: 1 },
      { ingredientId: "i9", quantity: 1 }
    ],
    nutrition: { calories: 300, protein: 5, fat: 12, carbs: 45 }
  },
  {
    id: "m2",
    name: "Hamburguesa con Queso",
    description: "Deliciosa carne con queso amarillo, lechuga y tomate.",
    price: 95.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/burger-mex/400/300",
    recipe: [
      { ingredientId: "i1", quantity: 1 },
      { ingredientId: "i2", quantity: 150 },
      { ingredientId: "i3", quantity: 1 },
      { ingredientId: "i19", quantity: 25 },
      { ingredientId: "i20", quantity: 35 },
      { ingredientId: "i18", quantity: 15 }
    ],
    nutrition: { calories: 580, protein: 28, fat: 32, carbs: 42 }
  },
  {
    id: "m7",
    name: "Hot Cakes Caseros (Orden 3)",
    description: "Receta secreta: Harina, azúcar, mantequilla, huevos y vainilla.",
    price: 65.00,
    category: "Comida",
    imageUrl: "https://picsum.photos/seed/hotcakes/400/300",
    recipe: [
      { ingredientId: "i24", quantity: 250 },
      { ingredientId: "i31", quantity: 200 },
      { ingredientId: "i27", quantity: 115 },
      { ingredientId: "i26", quantity: 3 },
      { ingredientId: "i25", quantity: 240 },
      { ingredientId: "i32", quantity: 15 },
      { ingredientId: "i33", quantity: 5 }
    ],
    nutrition: { calories: 550, protein: 15, fat: 22, carbs: 75 }
  },
  {
    id: "m9",
    name: "Pan de Dulce (La Esperanza)",
    description: "Pieza de pan dulce fresco traído hoy mismo.",
    price: 30.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/sweetbread/400/300",
    recipe: [
      { ingredientId: "i30", quantity: 1 }
    ],
    nutrition: { calories: 280, protein: 4, fat: 12, carbs: 38 }
  },
  {
    id: "g1",
    name: "Gomitas Pinguino (150g)",
    description: "Divertidas gomitas en forma de pingüino.",
    price: 30.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/g-pinguino/400/300",
    recipe: [{ ingredientId: "i13", quantity: 150 }],
    nutrition: { calories: 480, protein: 3, fat: 0, carbs: 115 }
  },
  {
    id: "g2",
    name: "Gomitas Dientes (150g)",
    description: "Las clásicas gomitas de dentadura.",
    price: 30.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/g-dientes/400/300",
    recipe: [{ ingredientId: "i13", quantity: 150 }],
    nutrition: { calories: 480, protein: 3, fat: 0, carbs: 115 }
  },
  {
    id: "g3",
    name: "Gomitas Mango Fuego (150g)",
    description: "Gomitas de mango con el toque picosito.",
    price: 30.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/g-mango/400/300",
    recipe: [{ ingredientId: "i13", quantity: 150 }],
    nutrition: { calories: 490, protein: 2, fat: 0, carbs: 120 }
  },
  {
    id: "g4",
    name: "Gomitas de Frutas (150g)",
    description: "Mix variado de sabores frutales.",
    price: 30.00,
    category: "Golosinas",
    imageUrl: "https://picsum.photos/seed/g-frutas/400/300",
    recipe: [{ ingredientId: "i13", quantity: 150 }],
    nutrition: { calories: 480, protein: 3, fat: 0, carbs: 115 }
  },
  {
    id: "b1",
    name: "Agua Bonafont (600ml)",
    description: "Botella fría de agua natural purificada.",
    price: 20.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/water-bottle/400/300",
    recipe: [{ ingredientId: "i9", quantity: 1 }],
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  {
    id: "b5",
    name: "Agua de Jamaica (Botella)",
    description: "Botella de agua fresca de jamaica.",
    price: 35.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/jamaica/400/300",
    recipe: [{ ingredientId: "i14", quantity: 1 }],
    nutrition: { calories: 180, protein: 0, fat: 0, carbs: 45 }
  },
  {
    id: "b6",
    name: "Agua de Horchata (Botella)",
    description: "Botella de agua fresca de horchata.",
    price: 35.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/horchata/400/300",
    recipe: [{ ingredientId: "i15", quantity: 1 }],
    nutrition: { calories: 250, protein: 2, fat: 4, carbs: 55 }
  },
  {
    id: "b7",
    name: "Agua de Limón (Botella)",
    description: "Botella de agua fresca de limón.",
    price: 35.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/lemonade/400/300",
    recipe: [{ ingredientId: "i16", quantity: 1 }],
    nutrition: { calories: 160, protein: 0, fat: 0, carbs: 40 }
  },
  {
    id: "b2",
    name: "Coca Cola (600ml)",
    description: "Botella fría de refresco.",
    price: 28.00,
    category: "Bebidas",
    imageUrl: "https://picsum.photos/seed/cola-bottle/400/300",
    recipe: [{ ingredientId: "i8", quantity: 1 }],
    nutrition: { calories: 210, protein: 0, fat: 0, carbs: 54 }
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
