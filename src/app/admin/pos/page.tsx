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
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

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
      title: "Venta Exitosa",
      description: `Pedido registrado. Total: S/ ${total.toFixed(2)}`,
    });
    setCart([]);
  };

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar POS */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 uni-gradient rounded-xl flex items-center justify-center text-white">
              <Calculator size={24} />
            </div>
            <h1 className="text-2xl font-bold">Punto de Venta (POS)</h1>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar producto..." 
              className="pl-9 h-10 rounded-xl"
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
                className="cursor-pointer hover:border-primary transition-all rounded-2xl overflow-hidden shadow-sm"
                onClick={() => addToCart(item)}
              >
                <div className="aspect-video bg-muted relative">
                  <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                </div>
                <CardContent className="p-3">
                  <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                  <p className="text-primary font-bold">S/ {item.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart / Checkout Panel */}
      <div className="w-96 bg-white border-l flex flex-col shadow-2xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-primary" />
            Orden Actual
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 pt-20">
              <ShoppingCart size={48} className="mb-2" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">S/ {item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={12} />
                      </Button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={12} />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 bg-muted/20 border-t space-y-4">
          <div className="flex justify-between text-lg">
            <span>Subtotal</span>
            <span>S/ {(total * 0.82).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>IGV (18%)</span>
            <span>S/ {(total * 0.18).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold border-t pt-4">
            <span>Total</span>
            <span className="text-primary">S/ {total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" className="rounded-xl h-12 gap-2">
              <Banknote size={18} /> Efectivo
            </Button>
            <Button variant="outline" className="rounded-xl h-12 gap-2">
              <CreditCard size={18} /> Tarjeta
            </Button>
          </div>

          <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" onClick={handleCheckout} disabled={cart.length === 0}>
            Completar Venta
          </Button>
          
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
            <Printer size={16} /> Imprimir Pre-cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}