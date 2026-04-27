
"use client";

import { useState, useMemo, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Search, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Wallet,
  Star,
  Plus,
  ThumbsUp,
  Sparkles,
  Utensils
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

type UpsellStep = 'none' | 'drink' | 'sweet';

export default function ClientMenu() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [upsellStep, setUpsellStep] = useState<UpsellStep>('none');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'preparing' | 'ready'>('idle');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === "Todas" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const drinkUpsells = useMemo(() => MENU_ITEMS.filter(item => item.category === "Bebidas").slice(0, 4), []);
  const sweetUpsells = useMemo(() => MENU_ITEMS.filter(item => item.category === "Golosinas").slice(0, 4), []);

  const addToCart = (item: any) => {
    setCart([...cart, item]);
    
    if (item.category === "Comida" && upsellStep === 'none') {
      setUpsellStep('drink');
    }

    toast({
      className: "uni-toast-info",
      title: "🍔 ¡Excelente elección!",
      description: `${item.name} añadido al carrito.`,
    });
  };

  const nextUpsell = () => {
    if (upsellStep === 'drink') {
      setUpsellStep('sweet');
    } else {
      setUpsellStep('none');
    }
  };

  const handlePayment = () => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const orderId = `#${Math.floor(100 + Math.random() * 900)}`;

    if (paymentMethod === 'cash') {
      const pendingOrders = JSON.parse(localStorage.getItem('pending_cash_orders') || '[]');
      pendingOrders.push({
        id: orderId,
        user: "Alumno Demo",
        total: totalAmount,
        items: cart.map(i => i.name).join(', '),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pending_cash_orders', JSON.stringify(pendingOrders));

      toast({
        className: "uni-toast-info",
        title: "💵 PEDIDO REGISTRADO EN CAJA",
        description: `Por favor, acude a la caja con tu número ${orderId} para pagar $${totalAmount.toFixed(2)}.`,
      });
    } else {
      toast({
        className: "uni-toast-success",
        title: "✅ TRANSFERENCIA RECIBIDA",
        description: "Tu pago ha sido validado. Iniciamos preparación.",
      });
    }

    setShowPayment(false);
    setCart([]);
    setOrderStatus('preparing');
    
    setTimeout(() => {
      setOrderStatus('ready');
      toast({
        className: "uni-toast-success",
        title: "🔔 ¡TU COMIDA ESTÁ LISTA!",
        description: "Pasa a ventanilla por tu orden.",
      });
    }, 8000);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      <header className="bg-white border-b-2 sticky top-0 z-40 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-primary/10" onClick={() => router.push('/login')}>
            <ArrowLeft size={24} />
          </Button>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-primary">UniEats</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Premium Fast Food</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative h-14 w-14 rounded-2xl bg-muted/50">
            <ShoppingCart size={28} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-black text-xs w-6 h-6 flex items-center justify-center rounded-full font-black border-2 border-white shadow-lg">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {orderStatus !== 'idle' && (
          <div className={cn(
            "mb-10 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl text-white mcd-gradient animate-in slide-in-from-top duration-500",
            orderStatus === 'ready' && "bg-emerald-500"
          )}>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center">
                {orderStatus === 'preparing' ? <Clock className="w-10 h-10 animate-spin" /> : <CheckCircle2 className="w-10 h-10" />}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest opacity-80">Estado de tu Orden</p>
                <p className="text-4xl font-black">
                  {orderStatus === 'preparing' ? '¡Estamos cocinando!' : '¡TU ORDEN ESTÁ LISTA!'}
                </p>
              </div>
            </div>
            {orderStatus === 'ready' && (
              <Button 
                variant="outline" 
                className="text-white border-white/40 hover:bg-white/10 rounded-2xl h-14 px-8 font-black gap-2"
                onClick={() => setShowFeedback(true)}
              >
                <ThumbsUp size={20} /> CALIFICAR SERVICIO
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-8 mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-5 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="¿Qué se te antoja hoy?" 
              className="pl-16 h-16 bg-white border-2 border-muted hover:border-primary/30 rounded-[2rem] text-xl font-medium shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {["Todas", ...CATEGORIES].map(cat => (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? "default" : "secondary"}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full h-14 px-10 font-black text-lg shadow-sm whitespace-nowrap transition-all",
                  selectedCategory === cat ? "scale-105 shadow-xl shadow-primary/20" : "hover:bg-muted"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group border-none shadow-xl rounded-[3rem] overflow-hidden bg-white mcd-card-hover">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-6 right-6 bg-secondary text-black h-12 px-6 rounded-full text-xl font-black flex items-center justify-center shadow-xl">
                  $ {item.price.toFixed(2)}
                </div>
              </div>
              <CardHeader className="p-8">
                <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-2">{item.category}</p>
                <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">{item.name}</CardTitle>
                <CardDescription className="text-base font-medium leading-relaxed mt-2 line-clamp-2">{item.description}</CardDescription>
              </CardHeader>
              <CardFooter className="p-8 pt-0">
                <Button 
                  className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-[0.97]" 
                  onClick={() => addToCart(item)}
                >
                  Añadir al Carrito
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
          <Button 
            className="w-full h-20 rounded-[2.5rem] shadow-2xl text-2xl font-black flex justify-between px-10 mcd-gradient border-none transition-all hover:scale-105 active:scale-95"
            onClick={() => setShowPayment(true)}
          >
            <span className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={32} />
              </div>
              {cart.length} productos
            </span>
            <span className="flex items-center gap-2">PAGAR $ {total.toFixed(2)} <ChevronRight size={28} /></span>
          </Button>
        </div>
      )}

      {/* Sequential Upsell Dialog */}
      <Dialog open={upsellStep !== 'none'} onOpenChange={(open) => !open && setUpsellStep('none')}>
        <DialogContent className="rounded-[3rem] p-10 max-w-2xl border-none">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary mb-4">
              {upsellStep === 'drink' ? <Sparkles size={50} fill="currentColor" /> : <Utensils size={50} />}
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-4xl font-black">
                {upsellStep === 'drink' ? '¿Quieres agregar un agua?' : '¿Deseas agregar una golosina?'}
              </DialogTitle>
              <DialogDescription className="text-xl font-medium">
                {upsellStep === 'drink' 
                  ? 'Refréscate con una de nuestras aguas naturales recién preparadas.' 
                  : '¡El toque dulce perfecto para terminar tu comida!'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {(upsellStep === 'drink' ? drinkUpsells : sweetUpsells).map(item => (
                <Card 
                  key={item.id} 
                  className="border-2 border-muted hover:border-secondary transition-all rounded-3xl overflow-hidden p-0 group cursor-pointer flex flex-col" 
                  onClick={() => {
                    setCart([...cart, item]);
                    nextUpsell();
                  }}
                >
                  <div className="aspect-video relative">
                    <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-black text-lg line-clamp-1">{item.name}</p>
                      <p className="text-secondary font-black text-xl">$ {item.price.toFixed(2)}</p>
                    </div>
                    <Button variant="secondary" className="w-full mt-3 rounded-xl font-black gap-2">
                      <Plus size={18} /> AÑADIR
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="ghost" className="text-muted-foreground font-black text-lg" onClick={nextUpsell}>
              {upsellStep === 'drink' ? 'No, gracias. Ver golosinas.' : 'Continuar con mi orden.'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-primary p-10 text-white">
            <h2 className="text-4xl font-black">Finalizar Pedido</h2>
            <p className="text-white/80 font-medium text-lg mt-2">¿Cómo prefieres pagar hoy?</p>
          </div>
          <div className="p-10 space-y-6">
            <Button 
              variant="outline" 
              className={cn(
                "h-24 w-full rounded-3xl flex items-center justify-start gap-6 px-8 border-2 transition-all",
                paymentMethod === 'transfer' ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
              onClick={() => setPaymentMethod('transfer')}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <CreditCard size={32} />
              </div>
              <div className="text-left">
                <p className="font-black text-xl">Transferencia</p>
                <p className="text-sm text-muted-foreground">Pago UNI-BANK</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className={cn(
                "h-24 w-full rounded-3xl flex items-center justify-start gap-6 px-8 border-2 transition-all",
                paymentMethod === 'cash' ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
              onClick={() => setPaymentMethod('cash')}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Wallet size={32} />
              </div>
              <div className="text-left">
                <p className="font-black text-xl">Efectivo en Caja</p>
                <p className="text-sm text-muted-foreground">Paga al recoger</p>
              </div>
            </Button>

            {paymentMethod === 'transfer' && (
              <div className="bg-muted/50 p-6 rounded-3xl border-2 border-dashed border-primary/30 text-center animate-in fade-in zoom-in duration-300">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">CLABE UNI-BANK</p>
                <p className="text-2xl font-black text-primary tracking-tighter">0123 4567 8901 2345 67</p>
              </div>
            )}

            <div className="flex justify-between items-center text-3xl font-black border-t-4 pt-6 mt-4">
              <span>Total</span>
              <span className="text-primary">$ {total.toFixed(2)}</span>
            </div>

            <Button 
              className="w-full h-16 rounded-2xl text-2xl font-black mcd-gradient" 
              onClick={handlePayment} 
              disabled={!paymentMethod}
            >
              Confirmar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="rounded-[3rem] p-12 max-w-md border-none text-center">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={60} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-4xl font-black text-center">¡Disfruta tu comida!</DialogTitle>
            <DialogDescription className="text-xl font-medium mt-4">
              ¿Qué tal te pareció el servicio de hoy?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 py-8">
            {[1, 2, 3, 4, 5].map(star => (
              <Button key={star} variant="ghost" size="icon" className="h-12 w-12 text-secondary hover:scale-125 transition-transform">
                <Star size={36} fill="currentColor" />
              </Button>
            ))}
          </div>
          <Button className="w-full h-16 rounded-2xl text-xl font-black" onClick={() => setShowFeedback(false)}>
            Enviar Comentarios
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
