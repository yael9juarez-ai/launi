
"use client";

import { useState } from 'react';
import { MENU_ITEMS, CATEGORIES, INGREDIENTS, MenuItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Search, 
  Trash2, 
  Plus, 
  Minus,
  ShoppingCart,
  ArrowLeft,
  Banknote,
  CreditCard,
  AlertCircle,
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
  const [inventory, setInventory] = useState(INGREDIENTS);
  const { toast } = useToast();
  const router = useRouter();

  const checkStockAvailability = (item: MenuItem) => {
    return item.recipe.every(r => {
      const ing = inventory.find(i => i.id === r.ingredientId);
      return ing && ing.stock >= r.quantity;
    });
  };

  const addToCart = (item: MenuItem) => {
    if (!checkStockAvailability(item)) {
      toast({
        variant: "destructive",
        title: "Insumos Insuficientes",
        description: `No hay ingredientes suficientes para preparar ${item.name}.`,
      });
      return;
    }
    
    const existing = cart.find(i => i.id === item.id);
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
        // Validar si hay stock para la nueva cantidad
        const hasStock = item.recipe.every(r => {
            const ing = inventory.find(inv => inv.id === r.ingredientId);
            return ing && ing.stock >= (r.quantity * newQty);
        });

        if (!hasStock && delta > 0) {
            toast({ variant: "destructive", title: "Límite de Insumos", description: "No hay más ingredientes disponibles." });
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
    
    // DEDUCIR INGREDIENTES DEL INVENTARIO REAL
    const newInventory = [...inventory];
    cart.forEach(cartItem => {
        cartItem.recipe.forEach((r: any) => {
            const ingIndex = newInventory.findIndex(i => i.id === r.ingredientId);
            if (ingIndex !== -1) {
                newInventory[ingIndex].stock -= (r.quantity * cartItem.quantity);
            }
        });
    });
    
    setInventory(newInventory);
    const finalTotal = total.toFixed(2);
    
    toast({
      className: "uni-toast-success",
      title: "✅ Venta Exitosa",
      description: `Pedido registrado. Insumos descontados del inventario. Total: $ ${finalTotal}`,
      action: (
        <ToastAction 
          altText="Imprimir" 
          onClick={() => {}}
          className="bg-emerald-600 text-white hover:bg-emerald-700 border-none rounded-xl font-bold"
        >
          Imprimir Ticket
        </ToastAction>
      ),
    });
    
    setCart([]);
  };

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-muted/30">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 uni-gradient rounded-xl flex items-center justify-center text-white">
                  <Calculator size={24} />
                </div>
                <h1 className="text-2xl font-black">Punto de Venta</h1>
              </div>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar producto..." 
                className="pl-9 h-10 rounded-xl bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['Todas', ...CATEGORIES].map(cat => (
              <Button 
                key={cat} 
                variant={activeCategory === cat ? 'default' : 'secondary'}
                className="rounded-full font-bold px-6"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pr-4">
            {filteredItems.map((item) => {
              const available = checkStockAvailability(item);
              return (
                <Card 
                  key={item.id} 
                  className={cn(
                    "group cursor-pointer border-2 transition-all rounded-2xl overflow-hidden shadow-sm hover:shadow-lg bg-white",
                    available ? "hover:border-primary" : "opacity-60 grayscale-[0.3]"
                  )}
                  onClick={() => addToCart(item)}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
                    {!available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge variant="destructive" className="font-black">SIN INSUMOS</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-black text-sm line-clamp-1">{item.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-primary font-black">$ {item.price.toFixed(2)}</p>
                      <Database size={14} className={available ? "text-emerald-500" : "text-destructive"} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="w-96 bg-white border-l flex flex-col shadow-2xl">
        <CardHeader className="border-b p-6">
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <ShoppingCart size={24} className="text-primary" />
            Orden Actual
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 pt-20">
              <ShoppingCart size={48} className="mb-4 animate-pulse" />
              <p className="font-bold">El carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="font-black text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-bold">$ {item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted rounded-xl p-1 px-2 border">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={12} />
                      </Button>
                      <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={12} />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-8 bg-muted/30 border-t space-y-4">
          <div className="flex justify-between text-3xl font-black border-t-2 border-primary/20 pt-4">
            <span>Total</span>
            <span className="text-primary">$ {total.toFixed(2)}</span>
          </div>

          <Button className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={handleCheckout} disabled={cart.length === 0}>
            Completar Venta
          </Button>
        </div>
      </div>
    </div>
  );
}
