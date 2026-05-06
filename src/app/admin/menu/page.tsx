
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
  Tag, 
  Box, 
  RotateCcw,
  Loader2,
  Search,
  Scale
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { MENU_ITEMS as INITIAL_MENU } from '@/lib/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MenuManagementPage() {
  const [search, setSearch] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Comida");
  const [newUnit, setNewUnit] = useState("pza");

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

  const { data: menuItems, isLoading: isDataLoading } = useCollection(menuQuery);

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
        imageUrl: `https://picsum.photos/seed/${id}/400/300`,
        recipe: [], // Iniciar con receta vacía
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNewName("");
      setNewPrice("");
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

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de quitar "${name}" del menú?`)) return;

    try {
      await deleteDoc(doc(firestore, 'menu_items', id));
      toast({
        className: "uni-toast-info",
        title: "🗑️ ELIMINADO",
        description: `${name} ha sido retirado del menú.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ ERROR",
        description: "No se pudo eliminar el producto.",
      });
    }
  };

  const syncMenu = async () => {
    if (!user) return;
    setIsInitializing(true);
    try {
      const batch = writeBatch(firestore);
      INITIAL_MENU.forEach((item) => {
        const docRef = doc(firestore, 'menu_items', item.id);
        batch.set(docRef, {
          ...item,
          unit: item.category === 'Bebidas' ? 'ml' : 'pza',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast({
        className: "uni-toast-success",
        title: "🔄 SINCRONIZADO",
        description: "Menú base cargado correctamente.",
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
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Configura lo que ven los alumnos</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl h-12 px-6 font-bold gap-2" 
          onClick={syncMenu}
          disabled={isInitializing}
        >
          {isInitializing ? <Loader2 className="animate-spin" /> : <RotateCcw size={20} />}
          Sincronizar Menú Base
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO DE AÑADIR */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white h-fit">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Plus className="text-primary" /> Nuevo Producto
            </CardTitle>
            <CardDescription className="font-bold">Añade productos individuales al menú.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest">Nombre del Producto</Label>
                <Input 
                  placeholder="Ej. Torta de Jamón" 
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
                <Label className="font-black text-xs uppercase tracking-widest">Unidad de Venta</Label>
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
                    <SelectItem value="lt">Litro (lt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black mcd-gradient shadow-lg" disabled={isAdding}>
                {isAdding ? <Loader2 className="animate-spin" /> : 'AÑADIR AL MENÚ'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LISTA DE PRODUCTOS */}
        <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <ClipboardList className="text-secondary" /> Menú Actual
              </CardTitle>
              <CardDescription className="font-bold">Productos visibles para los alumnos.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar en menú..." 
                className="pl-9 h-10 rounded-xl border-2" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2">
              {filteredItems.length === 0 ? (
                <div className="p-20 text-center opacity-20">
                  <Box size={80} className="mx-auto mb-4" />
                  <p className="text-2xl font-black">MENÚ VACÍO</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-6 hover:bg-muted/5 transition-colors">
                    <div className="w-20 h-20 relative rounded-2xl overflow-hidden shadow-md shrink-0">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black leading-tight">{item.name}</h3>
                        <Badge variant="outline" className="text-[9px] uppercase font-black">{item.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-primary font-black text-xl">
                          <DollarSign size={16} /> {item.price.toFixed(2)}
                          <span className="text-[10px] text-muted-foreground ml-1 uppercase">/ {item.unit}</span>
                        </div>
                        <Badge className="bg-secondary/20 text-secondary-foreground font-black text-[10px] gap-1">
                          <Tag size={10} /> {item.unit}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl h-12 w-12 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteProduct(item.id, item.name)}
                    >
                      <Trash2 size={24} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
