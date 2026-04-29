
"use client";

import { useState, useMemo, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus,
  ShoppingCart,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'ingredients');
  }, [firestore, user]);

  const { data: inventory, isLoading: isInvLoading } = useCollection(ingredientsQuery);

  const checkStockAvailability = (item: MenuItem, quantity: number = 1) => {
    if (!inventory) return true;
    return item.recipe.every(r => {
      const ing = inventory.find((i: any) => i.id === r.ingredientId);
      return ing && ing.currentStock >= (r.quantity * quantity);
    });
  };

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.id === item.id);
    const currentQty = existing ? existing.quantity : 0;
    
    if (!checkStockAvailability(item, currentQty + 1)) {
      toast({ variant: "destructive", title: "⚠️ AGOTADO", description: `Sin insumos para ${item.name}.` });
      return;
    }
    
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = MENU_ITEMS.find(m => m.id === id);
    if (!item) return;

    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        if (delta > 0 && !checkStockAvailability(item, newQty)) {
            toast({ variant: "destructive", title: "Límite de Insumos", description: "Inventario insuficiente." });
            return i;
        }
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;

    const orderId = `POS-${Date.now().toString().slice(-6)}`;
    
    const orderRef = doc(firestore, 'orders', orderId);
    await setDoc(orderRef, {
      id: orderId,
      userId: user.uid,
      user: 'Venta Directa (Caja)',
      totalAmount: total,
      status: 'Ready for Pickup',
      method: 'cash',
      orderDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      items: cart.map(item => ({
        name: item.name,
        qty: item.quantity,
        price: item.price
      }))
    });

    cart.forEach(cartItem => {
      cartItem.recipe.forEach((r: any) => {
        const ing = inventory?.find(i => i.id === r.ingredientId);
        if (ing) {
          const ingRef = doc(firestore, 'ingredients', ing.id);
          updateDocumentNonBlocking(ingRef, {
            currentStock: ing.currentStock - (r.quantity * cartItem.quantity),
            updatedAt: serverTimestamp()
          });
        }
      });
    });
    
    toast({ className: "uni-toast-success", title: "✅ VENTA COMPLETADA", description: "Venta registrada e insumos descontados en la nube." });
    setCart([]);
  };

  if (isUserLoading || (user && isInvLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F7F5F5]">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <header className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-black tracking-tighter">Caja Registradora</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sincronizado Cloud</p>
              </div>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar producto..." 
                className="pl-12 h-11 rounded-xl bg-white border-2 border-primary/10" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Todas', ...CATEGORIES].map(cat => (
              <Button 
                key={cat} 
                variant={activeCategory === cat ? 'default' : 'secondary'} 
                className="rounded-full font-black px-6 h-10" 
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {MENU_ITEMS.filter(item => (activeCategory === 'Todas' || item.category === activeCategory) && item.name.toLowerCase().includes(search.toLowerCase())).map((item) => {
              const avail = checkStockAvailability(item);
              return (
                <Card 
                  key={item.id} 
                  className={cn(
                    "group cursor-pointer border-2 transition-all rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl bg-white", 
                    avail ? "hover:border-primary" : "opacity-40 grayscale pointer-events-none"
                  )} 
                  onClick={() => addToCart(item)}
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-300" 
                      sizes="(max-width: 768px) 50vw, 20vw" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-black text-sm line-clamp-1 leading-tight">{item.name}</p>
                    <p className="text-primary font-black text-sm mt-1">$ {item.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="w-full lg:w-[400px] bg-white border-l-4 border-l-primary flex flex-col shadow-2xl h-[50vh] lg:h-full">
        <div className="p-6 bg-muted/20 border-b flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <ShoppingCart className="w-8 h-8 text-primary" /> Cesta
          </CardTitle>
          <Badge className="bg-primary text-white font-black h-8 px-4 rounded-full">{cart.length}</Badge>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
              <ShoppingCart size={64} className="mb-4" />
              <p className="font-black text-xl">CESTA VACÍA</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-[#F9F9F9] p-5 rounded-3xl border-2 border-transparent hover:border-primary/10 mb-4 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-black text-lg flex-1 leading-tight">{item.name}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-primary font-black text-xl">$ {(item.price * item.quantity).toFixed(2)}</p>
                  <div className="flex items-center bg-white rounded-2xl p-1.5 border-2 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
        
        <div className="p-8 bg-white border-t-4 space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Total a cobrar</span>
            <span className="text-5xl font-black text-primary leading-none">$ {total.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full h-20 rounded-[2rem] text-2xl font-black mcd-gradient shadow-xl shadow-primary/20" 
            onClick={handleCheckout} 
            disabled={cart.length === 0}
          >
            CONFIRMAR VENTA
          </Button>
        </div>
      </div>
    </div>
  );
}
