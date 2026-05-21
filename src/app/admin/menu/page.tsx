'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ClipboardList, 
  DollarSign, 
  Box, 
  RotateCcw,
  Loader2,
  Search,
  ChefHat,
  X,
  Eraser,
  Pencil,
  Check,
  Ban,
  Utensils
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { MENU_ITEMS as INITIAL_MENU } from '@/lib/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RecipeEntry {
  ingredientId: string;
  quantity: number;
}

export default function MenuManagementPage() {
  const [search, setSearch] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");

  // Form State
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Comida");
  const [newUnit, setNewUnit] = useState("pza");
  const [recipe, setRecipe] = useState<RecipeEntry[]>([]);

  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && (!user || user.displayName !== 'admin')) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const menuQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'menu_items');
  }, [firestore, user]);

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'ingredients');
  }, [firestore, user]);

  const { data: menuItems, isLoading: isDataLoading } = useCollection(menuQuery);
  const { data: availableIngredients } = useCollection(ingredientsQuery);

  const addIngredientToRecipe = (id: string) => {
    if (recipe.find(r => r.ingredientId === id)) return;
    setRecipe([...recipe, { ingredientId: id, quantity: 1 }]);
  };

  const removeIngredientFromRecipe = (id: string) => {
    setRecipe(recipe.filter(r => r.ingredientId !== id));
  };

  const updateRecipeQuantity = (id: string, qty: number) => {
    setRecipe(recipe.map(r => r.ingredientId === id ? { ...r, quantity: qty } : r));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    setIsAdding(true);
    const id = `M-${Date.now()}`;
    const productRef = doc(firestore, 'menu_items', id);

    try {
      await setDoc(productRef, {
        id,
        name: newName,
        price: parseFloat(newPrice),
        category: newCategory,
        unit: newUnit,
        description: `Producto de la cafetería (${newCategory})`,
        imageUrl: `https://picsum.photos/seed/${id}/600/400`,
        recipe: recipe,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNewName("");
      setNewPrice("");
      setRecipe([]);
      toast({
        className: "uni-toast-success",
        title: "✅ PRODUCTO AÑADIDO",
        description: `${newName} ya está disponible en el menú.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ ERROR",
        description: "No se pudo añadir el producto.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (id: string, currentPrice: number) => {
    setEditingId(id);
    setTempPrice(currentPrice.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempPrice("");
  };

  const handleUpdatePrice = (id: string) => {
    const price = parseFloat(tempPrice);
    if (isNaN(price)) {
      toast({
        variant: "destructive",
        title: "❌ VALOR INVÁLIDO",
        description: "El precio debe ser un número válido.",
      });
      return;
    }

    const docRef = doc(firestore, 'menu_items', id);
    updateDocumentNonBlocking(docRef, {
      price: price,
      updatedAt: serverTimestamp()
    });

    setEditingId(null);
    toast({
      className: "uni-toast-success",
      title: "💰 PRECIO ACTUALIZADO",
      description: "El cambio se ha guardado correctamente.",
    });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    const docRef = doc(firestore, 'menu_items', id);
    deleteDocumentNonBlocking(docRef);
    
    toast({
      className: "uni-toast-info",
      title: "🗑️ ELIMINADO",
      description: `${name} ha sido retirado del menú.`,
    });
  };

  const clearAllMenu = async () => {
    setIsInitializing(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'menu_items'));
      const batch = writeBatch(firestore);
      querySnapshot.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
      toast({
        className: "uni-toast-info",
        title: "🧹 MENÚ VACIADO",
        description: "Se han eliminado todos los productos del menú.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ ERROR",
        description: "No se pudo vaciar el menú.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const syncMenu = async () => {
    if (!user) return;
    setIsInitializing(true);
    try {
      const batch = writeBatch(firestore);
      INITIAL_MENU.forEach((item) => {
        const docRef = doc(firestore, 'menu_items', item.id);
        const finalImageUrl = item.imageUrl.startsWith('/') 
          ? `https://picsum.photos/seed/${item.id}/600/400`
          : item.imageUrl;

        batch.set(docRef, {
          ...item,
          imageUrl: finalImageUrl,
          unit: item.unit || (item.category === 'Bebidas' ? 'ml' : 'pza'),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast({
        className: "uni-toast-success",
        title: "🔄 SINCRONIZADO",
        description: "Menú base cargado correctamente con imágenes actualizadas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ ERROR",
        description: "Error al sincronizar el menú.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const filteredItems = menuItems?.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isUserLoading || (user && isDataLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">Gestión de Menú</h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Configura productos e ingredientes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-12 px-6 font-bold gap-2 text-destructive hover:bg-destructive/10 border-destructive/20">
                <Eraser size={20} /> Vaciar Menú
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2rem]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black">¿Estás completamente seguro?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold">
                  Esta acción eliminará TODOS los productos que tienes actualmente en el menú.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllMenu} className="rounded-xl font-black bg-destructive text-white hover:bg-destructive/90">
                  SÍ, VACIAR TODO
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            variant="outline" 
            className="rounded-xl h-12 px-6 font-bold gap-2" 
            onClick={syncMenu}
            disabled={isInitializing}
          >
            {isInitializing ? <Loader2 className="animate-spin" /> : <RotateCcw size={20} />}
            Sincronizar Base
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORMULARIO DE AÑADIR */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white lg:sticky lg:top-8">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Plus className="text-primary" /> Nuevo Producto
            </CardTitle>
            <CardDescription className="font-bold">Crea un nuevo artículo para la cafetería.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest">Nombre</Label>
                <Input 
                  placeholder="Nombre del producto" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl border-2 h-12"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest">Precio ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="rounded-xl border-2 h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest">Categoría</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="rounded-xl border-2 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comida">Comida</SelectItem>
                      <SelectItem value="Bebidas">Bebidas</SelectItem>
                      <SelectItem value="Golosinas">Golosinas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest">Unidad</Label>
                <Select value={newUnit} onValueChange={setNewUnit}>
                  <SelectTrigger className="rounded-xl border-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pza">Pieza (pza)</SelectItem>
                    <SelectItem value="orden">Orden (orden)</SelectItem>
                    <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                    <SelectItem value="gr">Gramo (gr)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 border-2 p-4 rounded-2xl bg-muted/5">
                <Label className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <ChefHat size={14} className="text-primary" /> Receta de Insumos
                </Label>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recipe.length === 0 ? (
                    <p className="text-[10px] font-bold text-muted-foreground text-center py-4 italic">Sin ingredientes asignados</p>
                  ) : (
                    recipe.map((item) => {
                      const ing = availableIngredients?.find(i => i.id === item.ingredientId);
                      return (
                        <div key={item.ingredientId} className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border shadow-sm animate-in fade-in slide-in-from-right-2">
                          <span className="text-xs font-bold truncate flex-1">{ing?.name}</span>
                          <Input 
                            type="number" 
                            className="w-14 h-8 text-center text-xs font-black p-1"
                            value={item.quantity}
                            onChange={(e) => updateRecipeQuantity(item.ingredientId, parseFloat(e.target.value) || 0)}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeIngredientFromRecipe(item.ingredientId)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-[9px] font-black text-muted-foreground uppercase mb-2">Vincular Insumo:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableIngredients?.map((ing) => (
                      <Badge 
                        key={ing.id} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-[9px]"
                        onClick={() => addIngredientToRecipe(ing.id)}
                      >
                        + {ing.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl font-black mcd-gradient shadow-lg" disabled={isAdding}>
                {isAdding ? <Loader2 className="animate-spin" /> : 'PUBLICAR EN MENÚ'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LISTA DE PRODUCTOS */}
        <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b-2 bg-muted/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-black flex items-center gap-3">
                  <Utensils className="text-secondary" /> Menú Disponible
                </CardTitle>
                <CardDescription className="font-bold">Visualiza y edita los productos activos.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar platillo..." 
                  className="pl-12 h-11 rounded-xl border-2 bg-white" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-6 space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="py-24 text-center">
                    <Box size={80} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                    <p className="text-xl font-black text-muted-foreground opacity-40 uppercase tracking-tighter">No hay productos que mostrar</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[2rem] border-2 border-muted hover:border-primary/20 transition-all bg-white shadow-sm group">
                      <div className="w-full md:w-32 h-32 relative rounded-2xl overflow-hidden shadow-inner shrink-0 bg-muted/30">
                        <Image 
                          src={item.imageUrl} 
                          alt={item.name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110" 
                          data-ai-hint="food meal"
                          unoptimized={item.imageUrl.startsWith('/images/')}
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black leading-tight tracking-tight uppercase">{item.name}</h3>
                          <Badge className="rounded-full font-black text-[9px] uppercase tracking-widest bg-primary/10 text-primary border-none">
                            {item.category}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {item.recipe?.length > 0 ? (
                            item.recipe.map((r: any, idx: number) => {
                              const ing = availableIngredients?.find(i => i.id === r.ingredientId);
                              return (
                                <Badge key={idx} variant="outline" className="text-[9px] font-bold border-muted-foreground/10 bg-muted/20">
                                  {ing?.name || 'Insumo'} ({r.quantity})
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-[9px] font-bold text-muted-foreground italic">Sin receta definida</span>
                          )}
                        </div>

                        <div className="flex items-center pt-2">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-2 animate-in zoom-in-95">
                              <DollarSign size={20} className="text-primary" />
                              <Input 
                                type="number" 
                                className="w-28 h-10 font-black text-lg rounded-xl border-2 border-primary bg-primary/5 shadow-inner" 
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                autoFocus
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 text-emerald-500 bg-emerald-50 rounded-xl"
                                onClick={() => handleUpdatePrice(item.id)}
                              >
                                <Check size={20} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 text-muted-foreground bg-muted rounded-xl"
                                onClick={cancelEditing}
                              >
                                <Ban size={20} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center text-primary font-black text-2xl gap-2">
                              <DollarSign size={18} /> {item.price.toFixed(2)}
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">/ {item.unit}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-muted"
                                onClick={() => startEditing(item.id, item.price)}
                              >
                                <Pencil size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-2xl h-14 w-14 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors border-2 border-transparent hover:border-destructive/20"
                            >
                              <Trash2 size={24} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-black text-2xl">¿Eliminar "{item.name}"?</AlertDialogTitle>
                              <AlertDialogDescription className="font-bold">
                                Esta acción retirará el producto del menú visible para todos los alumnos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl font-bold">CANCELAR</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProduct(item.id, item.name)}
                                className="rounded-xl font-black bg-destructive text-white hover:bg-destructive/90"
                              >
                                SÍ, ELIMINAR
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

