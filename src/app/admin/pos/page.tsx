
"use client";

import { useState, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem, Ingredient, INGREDIENTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { 
  Calculator, 
  Search, 
  Trash2, 
  Plus, 
  Minus,
  ShoppingCart,
  ArrowLeft,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ToastAction } from "@/components/ui/toast";
import { cn } from '@/lib/utils';

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const syncInventory = () => {
    const saved = localStorage.getItem('uni_inventory');
    if (!saved) {
      setInventory(INGREDIENTS);
      localStorage.setItem('uni_inventory', JSON.stringify(INGREDIENTS));
    } else {
      setInventory(JSON.parse(saved));
    }
  };

  useEffect(() => {
    syncInventory();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uni_inventory') syncInventory();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkStockAvailability = (item: MenuItem, quantity: number = 1) => {
    const currentInv = JSON.parse(localStorage.getItem('uni_inventory') || JSON.stringify(INGREDIENTS));
    return item.recipe.every(r => {
      const ing = currentInv.find((i: any) => i.id === r.ingredientId);
      return ing && ing.stock >= (r.quantity * quantity);
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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const currentInv = JSON.parse(localStorage.getItem('uni_inventory') || '[]');
    const newInventory = [...currentInv];

    cart.forEach(cartItem => {
      cartItem.recipe.forEach((r: any) => {
        const idx = newInventory.findIndex((i: any) => i.id === r.ingredientId);
        if (idx !== -1) newInventory[idx].stock -= (r.quantity * cartItem.quantity);
      });
    });
    
    localStorage.setItem('uni_inventory', JSON.stringify(newInventory));
    window.dispatchEvent(new StorageEvent('storage', { key: 'uni_inventory' }));

    const currentTotal = parseFloat(localStorage.getItem('confirmed_sales_total') || '0');
    localStorage.setItem('confirmed_sales_total', (currentTotal + total).toString());

    const currentStats = JSON.parse(localStorage.getItem('confirmed_items_breakdown') || '{}');
    cart.forEach(item => {
      if (!currentStats[item.id]) currentStats[item.id] = { name: item.name, qty: 0, total: 0 };
      currentStats[item.id].qty += item.quantity;
      currentStats[item.id].total += (item.price * item.quantity);
    });
    localStorage.setItem('confirmed_items_breakdown', JSON.stringify(currentStats));
    
    toast({ className: "uni-toast-success", title: "✅ VENTA COMPLETADA", description: "Venta registrada e insumos descontados." });
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-muted/30">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-xl md:text-2xl font-black">Caja Registradora</h1>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9 rounded-xl bg-white border-2" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Todas', ...CATEGORIES].map(cat => (
              <Button key={cat} variant={activeCategory === cat ? 'default' : 'secondary'} className="rounded-full font-bold px-6" onClick={() => setActiveCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {MENU_ITEMS.filter(item => (activeCategory === 'Todas' || item.category === activeCategory) && item.name.toLowerCase().includes(search.toLowerCase())).map((item) => {
              const avail = checkStockAvailability(item);
              return (
                <Card key={item.id} className={cn("group cursor-pointer border-2 transition-all rounded-2xl overflow-hidden shadow-sm hover:shadow-lg bg-white", avail ? "hover:border-primary" : "opacity-40 grayscale pointer-events-none")} onClick={() => addToCart(item)}>
                  <div className="aspect-video relative overflow-hidden">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 20vw" />
                  </div>
                  <CardContent className="p-3">
                    <p className="font-black text-sm line-clamp-1">{item.name}</p>
                    <p className="text-primary font-black text-sm">$ {item.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="w-full lg:w-96 bg-white border-l flex flex-col shadow-2xl h-[50vh] lg:h-full">
        <CardHeader className="border-b p-4 bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <ShoppingCart className="w-6 h-6 text-primary" /> Cesta de Cobro
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-muted/50 p-4 rounded-2xl border-2 border-transparent mb-3">
              <div className="flex justify-between items-start mb-2">
                <p className="font-black text-sm flex-1">{item.name}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-primary font-black text-sm">$ {(item.price * item.quantity).toFixed(2)}</p>
                <div className="flex items-center bg-white rounded-lg p-1 border">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                  <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="p-6 bg-white border-t space-y-4">
          <div className="flex justify-between text-3xl font-black">
            <span className="text-lg">TOTAL</span> <span className="text-primary">$ {total.toFixed(2)}</span>
          </div>
          <Button className="w-full h-16 rounded-2xl text-xl font-black mcd-gradient" onClick={handleCheckout} disabled={cart.length === 0}>
            CONFIRMAR COBRO
          </Button>
        </div>
      </div>
    </div>
  );
}
