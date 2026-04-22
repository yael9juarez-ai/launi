
"use client";

import { useState, useEffect } from 'react';
import { UtensilsCrossed, Clock, CheckCircle2, ArrowLeft, ShoppingCart, Plus, Minus, X, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MENU_ITEMS, CATEGORIES } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function QueueKioskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  // Queue States
  const preparing = ["#102", "#104", "#105", "#107"];
  const ready = ["#098", "#099", "#101"];

  // Ordering States
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  
  // Security States
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredItems = MENU_ITEMS.filter(item => 
    selectedCategory === "Todas" || item.category === selectedCategory
  );

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
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

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    toast({
      className: "uni-toast-success",
      title: "✅ Pedido Confirmado",
      description: "Por favor, dirígete a la caja para realizar tu pago.",
    });
    setCart([]);
    setShowCart(false);
  };

  const handleBackWithPin = () => {
    if (pinInput === "1234") {
      router.back();
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  return (
    <div className="h-screen bg-[#F0F2F5] overflow-hidden flex flex-col font-body">
      {/* Kiosk Header */}
      <header className="bg-white border-b-4 border-primary/10 px-8 py-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-2xl h-14 w-14 border-2 hover:bg-primary/5"
            onClick={() => {
              setPinInput("");
              setPinError(false);
              setShowPinDialog(true);
            }}
          >
            <ArrowLeft size={28} />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 uni-gradient rounded-2xl flex items-center justify-center text-white shadow-xl">
              <UtensilsCrossed size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">UniEats <span className="text-primary">KIOSKO</span></h1>
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Autoservicio & Turnos Digitales</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black text-primary tabular-nums">{time}</p>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">Cerca de Tí, Siempre Fresco</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section: Queue Status (35%) */}
        <aside className="w-[35%] bg-[#1a1a1a] p-6 flex flex-col gap-6 border-r-4 border-black/10">
          <Card className="flex-1 border-none bg-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
            <CardHeader className="bg-primary/10 border-b border-white/10 p-6">
              <CardTitle className="text-white flex items-center gap-3 text-2xl font-black tracking-tight">
                <Clock className="text-primary w-8 h-8" /> PREPARANDO
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <div className="grid grid-cols-2 gap-4">
                {preparing.map(num => (
                  <div key={num} className="bg-white/10 h-24 rounded-3xl flex items-center justify-center border-2 border-white/5">
                    <span className="text-4xl font-black text-white">{num}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 border-none bg-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
            <CardHeader className="bg-emerald-500/10 border-b border-white/10 p-6">
              <CardTitle className="text-white flex items-center gap-3 text-2xl font-black tracking-tight">
                <CheckCircle2 className="text-emerald-500 w-8 h-8" /> LISTOS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <div className="grid grid-cols-2 gap-4">
                {ready.map(num => (
                  <div key={num} className="bg-emerald-500 h-24 rounded-3xl flex items-center justify-center border-2 border-emerald-400 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <span className="text-4xl font-black text-white">{num}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right Section: Interactive Menu (65%) */}
        <main className="flex-1 flex flex-col p-8 gap-8 overflow-hidden">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <LayoutGrid className="text-primary" /> EXPLORA EL MENÚ
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {["Todas", ...CATEGORIES].map(cat => (
                <Button 
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-2xl h-16 px-8 font-black text-lg transition-all border-2 ${selectedCategory === cat ? 'scale-105 shadow-xl shadow-primary/20' : ''}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group border-none shadow-lg rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl transition-all active:scale-95 cursor-pointer"
                  onClick={() => addToCart(item)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <span className="text-white text-2xl font-black">$ {item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xl font-black mb-1">{item.name}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Checkout Bar */}
          <div className="mt-auto">
            <Button 
              className="w-full h-24 rounded-[2rem] shadow-2xl text-2xl font-black flex justify-between px-10 transition-all active:scale-95"
              onClick={() => setShowCart(true)}
              disabled={cart.length === 0}
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <ShoppingCart size={40} />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-primary text-sm font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-primary">
                      {cart.length}
                    </span>
                  )}
                </div>
                <span>VER MI PEDIDO</span>
              </div>
              <span className="bg-white/20 px-8 py-3 rounded-2xl">$ {cartTotal.toFixed(2)} MXN</span>
            </Button>
          </div>
        </main>
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white flex justify-between items-center">
            <h2 className="text-3xl font-black">TU ORDEN</h2>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-12 w-12" onClick={() => setShowCart(false)}>
              <X size={32} />
            </Button>
          </div>
          <div className="p-8">
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-6 last:border-0">
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2">
                        <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="text-xl font-black">{item.name}</p>
                        <p className="text-sm font-bold text-muted-foreground">$ {item.price.toFixed(2)} c/u</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-muted rounded-2xl p-2 border-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={20} />
                        </Button>
                        <span className="w-12 text-center text-xl font-black">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={20} />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-12 w-12 rounded-full" onClick={() => removeFromCart(item.id)}>
                        <X size={24} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-8 pt-8 border-t-4 border-muted space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-muted-foreground">TOTAL A PAGAR</span>
                <span className="text-5xl font-black text-primary">$ {cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full h-20 text-2xl font-black rounded-3xl shadow-xl shadow-primary/20" onClick={handleCheckout}>
                CONFIRMAR Y PAGAR EN CAJA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Protection Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-10">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-black">ACCESO RESTRINGIDO</DialogTitle>
            <DialogDescription className="text-lg font-medium">
              Ingresa el código de seguridad para salir del modo Kiosko.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-4">
            <Input 
              type="password" 
              placeholder="****" 
              className={`text-center text-4xl h-20 font-black tracking-[1em] rounded-2xl ${pinError ? 'border-destructive bg-destructive/5 animate-shake' : 'bg-muted border-none'}`}
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
            />
            {pinError && <p className="text-destructive text-center font-bold">Código incorrecto. Intenta de nuevo.</p>}
          </div>
          <DialogFooter>
            <Button className="w-full h-16 text-xl font-black rounded-2xl" onClick={handleBackWithPin}>
              DESBLOQUEAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
