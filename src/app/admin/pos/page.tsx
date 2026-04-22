"use client";

import { useState } from 'react';
import { MENU_ITEMS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calculator, 
  Search, 
  Trash2, 
  Printer, 
  Plus, 
  Minus,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  ShoppingCart,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const addToCart = (item: any) => {
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
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    toast({
      className: "uni-toast-success",
      title: "✅ Venta Exitosa",
      description: (
        <div className="flex flex-col gap-1">
          <p className="font-bold text-emerald-700">¡Pedido registrado correctamente!</p>
          <p className="text-sm">Total cobrado: S/ {total.toFixed(2)}</p>
        </div>
      ),
    });
    setCart([]);
  };

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar POS */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white transition-colors" onClick={() => router.push('/admin/dashboard')}>
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

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pr-4">
            {MENU_ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
              <Card 
                key={item.id} 
                className="group cursor-pointer hover:border-primary border-2 transition-all rounded-2xl overflow-hidden shadow-sm hover:shadow-lg bg-white"
                onClick={() => addToCart(item)}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>
                <CardContent className="p-3">
                  <p className="font-black text-sm line-clamp-1">{item.name}</p>
                  <p className="text-primary font-black">S/ {item.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart / Checkout Panel */}
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
                    <p className="text-xs text-muted-foreground font-bold">S/ {item.price.toFixed(2)} c/u</p>
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
          <div className="flex justify-between text-base font-bold">
            <span className="text-muted-foreground">Subtotal</span>
            <span>S/ {(total * 0.82).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-muted-foreground">
            <span>IGV (18%)</span>
            <span>S/ {(total * 0.18).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-3xl font-black border-t-2 border-primary/20 pt-4">
            <span>Total</span>
            <span className="text-primary">S/ {total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="outline" className="rounded-2xl h-14 gap-2 font-bold border-2 border-primary/10 hover:border-primary/40">
              <Banknote size={20} className="text-emerald-600" /> Efectivo
            </Button>
            <Button variant="outline" className="rounded-2xl h-14 gap-2 font-bold border-2 border-primary/10 hover:border-primary/40">
              <CreditCard size={20} className="text-blue-600" /> Tarjeta
            </Button>
          </div>

          <Button className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={handleCheckout} disabled={cart.length === 0}>
            Completar Venta
          </Button>
          
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground font-bold hover:bg-white">
            <Printer size={16} /> Imprimir Pre-cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}