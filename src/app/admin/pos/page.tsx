
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
    if (saved) {
      const parsed = JSON.parse(saved);
      // Forzamos actualización si detectamos que faltan nuevos ingredientes técnicos
      if (!parsed.find((i: any) => i.id === 'i33')) {
        setInventory(INGREDIENTS);
        localStorage.setItem('uni_inventory', JSON.stringify(INGREDIENTS));
      } else {
        setInventory(parsed);
      }
    } else {
      setInventory(INGREDIENTS);
      localStorage.setItem('uni_inventory', JSON.stringify(INGREDIENTS));
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
    if (inventory.length === 0) return false;
    return item.recipe.every(r => {
      const ing = inventory.find(i => i.id === r.ingredientId);
      return ing && ing.stock >= (r.quantity * quantity);
    });
  };

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.id === item.id);
    const currentQty = existing ? existing.quantity : 0;
    
    if (!checkStockAvailability(item, currentQty + 1)) {
      toast({
        variant: "destructive",
        title: "⚠️ INSUMOS INSUFICIENTES",
        description: `No hay ingredientes suficientes para preparar otro ${item.name}.`,
      });
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
            toast({ variant: "destructive", title: "Límite de Insumos", description: "Inventario agotado para este producto." });
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
    
    const savedInv = localStorage.getItem('uni_inventory');
    const freshInv = savedInv ? JSON.parse(savedInv) : [...inventory];
    const newInventory = freshInv.map((ing: any) => ({ ...ing }));

    cart.forEach(cartItem => {
      cartItem.recipe.forEach((r: any) => {
        const ingIndex = newInventory.findIndex((i: any) => i.id === r.ingredientId);
        if (ingIndex !== -1) {
          newInventory[ingIndex].stock -= (r.quantity * cartItem.quantity);
        }
      });
    });
    
    localStorage.setItem('uni_inventory', JSON.stringify(newInventory));
    setInventory(newInventory);
    
    window.dispatchEvent(new StorageEvent('storage', { key: 'uni_inventory' }));

    const currentTotal = parseFloat(localStorage.getItem('confirmed_sales_total') || '0');
    localStorage.setItem('confirmed_sales_total', (currentTotal + total).toString());

    const currentStats = JSON.parse(localStorage.getItem('confirmed_items_breakdown') || '{}');
    cart.forEach(item => {
      if (!currentStats[item.id]) {
        currentStats[item.id] = { name: item.name, qty: 0, total: 0 };
      }
      currentStats[item.id].qty += item.quantity;
      currentStats[item.id].total += (item.price * item.quantity);
    });
    localStorage.setItem('confirmed_items_breakdown', JSON.stringify(currentStats));
    
    toast({
      className: "uni-toast-success",
      title: "✅ VENTA COMPLETADA",
      description: "Insumos descontados y dinero sumado al corte financiero.",
      action: <ToastAction altText="Ticket" className="font-bold">Imprimir Ticket</ToastAction>,
    });
    
    setCart([]);
  };

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-muted/30">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 uni-gradient rounded-xl flex items-center justify-center text-white">
                  <Calculator size={24} />
                </div>
                <h1 className="text-xl md:text-2xl font-black">Caja Registradora</h1>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre..." 
                className="pl-9 h-10 rounded-xl bg-white border-2 focus:border-primary w-full"
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
                className="rounded-full font-bold px-5 md:px-6 h-10 md:h-11 text-xs md:text-sm whitespace-nowrap"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pr-2 md:pr-4">
            {filteredItems.map((item) => {
              const available = checkStockAvailability(item);
              return (
                <Card 
                  key={item.id} 
                  className={cn(
                    "group cursor-pointer border-2 transition-all rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg bg-white",
                    available ? "hover:border-primary" : "opacity-40 grayscale pointer-events-none"
                  )}
                  onClick={() => addToCart(item)}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {!available && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive" className="font-black text-[10px] md:text-xs">AGOTADO</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2 md:p-3">
                    <p className="font-black text-xs md:text-sm line-clamp-1">{item.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-primary font-black text-xs md:text-sm">$ {item.price.toFixed(2)}</p>
                      <Database size={12} className={available ? "text-emerald-500" : "text-destructive"} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="w-full lg:w-96 bg-white border-l flex flex-col shadow-2xl h-[40vh] lg:h-full">
        <CardHeader className="border-b p-4 md:p-6 bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-black">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Cesta de Cobro
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4 md:p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 pt-10 md:pt-20">
              <ShoppingCart size={48} className="mb-4" />
              <p className="font-black text-base md:text-lg">Esperando productos...</p>
            </div>
          ) : (
            <div className="space-y-3 md:y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-muted/50 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-transparent hover:border-muted-foreground/20 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-xs md:text-sm leading-tight flex-1">{item.name}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-primary font-black text-xs md:text-sm">$ {(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center bg-white rounded-lg p-1 border shadow-sm">
                      <Button variant="ghost" size="icon" className="h-5 w-5 md:h-6 md:w-6" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      </Button>
                      <span className="w-5 md:w-6 text-center text-[10px] md:text-xs font-black">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 md:h-6 md:w-6" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 md:p-8 bg-white border-t space-y-3 md:space-y-4">
          <div className="flex justify-between text-2xl md:text-3xl font-black">
            <span className="text-lg md:text-2xl">TOTAL</span>
            <span className="text-primary">$ {total.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl text-lg md:text-xl font-black shadow-xl shadow-primary/30 mcd-gradient" 
            onClick={handleCheckout} 
            disabled={cart.length === 0}
          >
            CONFIRMAR COBRO
          </Button>
        </div>
      </div>
    </div>
  );
}
