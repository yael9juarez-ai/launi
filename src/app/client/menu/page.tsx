
"use client";

import { useState, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Search, 
  Clock, 
  ChevronRight,
  Activity,
  ArrowLeft,
  AlertCircle,
  Banknote,
  Star,
  CheckCircle2,
  X,
  CreditCard,
  Wallet
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

export default function ClientMenu() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'preparing' | 'ready'>('idle');
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === "Todas" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: any) => {
    if (item.stock <= 0) {
      toast({
        variant: "destructive",
        className: "uni-toast-error",
        title: "🚫 Agotado",
        description: `Lo sentimos, ${item.name} no está disponible por el momento.`,
      });
      return;
    }

    setCart([...cart, item]);
    toast({
      className: "uni-toast-info",
      title: "🍴 ¡Buen Provecho!",
      description: `${item.name} agregado al carrito.`,
    });
  };

  const handlePayment = (method: 'transfer' | 'cash') => {
    setShowPayment(false);
    setPaymentMethod(null);
    setCart([]);
    setOrderStatus('preparing');
    
    toast({
      className: "uni-toast-success",
      title: method === 'transfer' ? "✅ Pago Registrado" : "✅ Pedido Confirmado",
      description: method === 'transfer' 
        ? "Tu transferencia será validada al recoger tu pedido." 
        : "Por favor, realiza tu pago en efectivo en la caja al recoger tu pedido.",
    });

    // Simulamos que la orden está lista en 8 segundos para la demo
    setTimeout(() => {
      setOrderStatus('ready');
      toast({
        className: "uni-toast-success",
        title: "🔔 ¡TU ORDEN ESTÁ LISTA!",
        description: "Pasa por el mostrador para recoger tu comida.",
        duration: 10000,
      });
    }, 8000);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#F7F5F5] pb-24">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" onClick={() => router.push('/login')}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 uni-gradient rounded flex items-center justify-center text-white">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-xl font-bold">UniEats</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {orderStatus === 'ready' && (
              <Button 
                variant="destructive" 
                className="animate-bounce rounded-full font-black px-6"
                onClick={() => setShowFeedback(true)}
              >
                ¡ORDEN LISTA! 🚀
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Banner Informativo */}
        <div className="mb-8 p-6 bg-foreground text-white rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-2xl gap-4">
          <div className="flex items-center gap-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
              orderStatus === 'ready' ? "bg-emerald-500 animate-pulse" : "bg-primary/20"
            )}>
              {orderStatus === 'ready' ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="text-primary w-8 h-8" />}
            </div>
            <div>
              <p className="text-sm font-medium opacity-70 uppercase tracking-widest">
                {orderStatus === 'idle' ? 'Espera Estimada' : orderStatus === 'preparing' ? 'Estado del Pedido' : '¡Listo!'}
              </p>
              <p className="text-3xl font-black">
                {orderStatus === 'idle' ? '~ 12 Minutos' : orderStatus === 'preparing' ? 'En Cocina...' : '¡Recógelo ahora!'}
              </p>
            </div>
          </div>
          <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-2xl h-12 px-8 font-bold" onClick={() => router.push('/queue')}>
            Ver Cola Real
          </Button>
        </div>

        {/* Buscador y Categorías */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="¿Qué te apetece hoy? Tacos, Hamburguesa..." 
              className="pl-12 h-12 bg-white border-none shadow-sm rounded-2xl text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["Todas", ...CATEGORIES].map(cat => (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? "default" : "secondary"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full h-12 px-6 font-bold whitespace-nowrap shadow-sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <Card key={item.id} className={cn(
              "group border-none shadow-lg rounded-[2rem] overflow-hidden transition-all bg-white",
              item.stock > 0 ? "hover:shadow-2xl hover:-translate-y-2" : "opacity-75 grayscale-[0.5]"
            )}>
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {item.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-2xl">
                      Agotado
                    </Badge>
                  </div>
                )}
                <Badge className="absolute top-4 right-4 bg-white/95 text-primary hover:bg-white h-9 px-4 rounded-full text-base font-black shadow-lg">
                  $ {item.price.toFixed(2)}
                </Badge>
              </div>
              <CardHeader className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="h-7 px-3 rounded-full text-[10px] gap-1 font-bold hover:bg-primary hover:text-white transition-colors">
                        <Activity size={12} /> NUTRICIÓN
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{item.name}</DialogTitle>
                        <DialogDescription className="font-medium">Valores por porción individual.</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-5 bg-primary/5 rounded-3xl text-center border-2 border-primary/5">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Calorías</p>
                          <p className="text-3xl font-black text-primary">{item.nutrition.calories}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">KCAL</p>
                        </div>
                        <div className="p-5 bg-emerald-50 rounded-3xl text-center border-2 border-emerald-100">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Proteínas</p>
                          <p className="text-3xl font-black text-emerald-600">{item.nutrition.protein}g</p>
                          <p className="text-[10px] font-bold text-muted-foreground">MÚSCULO</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardTitle className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{item.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm font-medium leading-relaxed">{item.description}</CardDescription>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                  <AlertCircle size={10} className={item.stock < 10 ? "text-primary animate-pulse" : ""} />
                  {item.stock} unidades disponibles
                </div>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  onClick={() => addToCart(item)}
                  disabled={item.stock <= 0}
                >
                  {item.stock > 0 ? "Pedir Ahora" : "No Disponible"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Barra de Pago Flotante */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <Button 
            className="w-full h-16 rounded-[2rem] shadow-[0_20px_50px_rgba(227,6,19,0.3)] text-lg font-black flex justify-between items-center px-8 transition-all hover:scale-[1.03]"
            onClick={() => {
              setPaymentMethod(null);
              setShowPayment(true);
            }}
          >
            <span className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} />
              </div>
              {cart.length} productos
            </span>
            <span className="flex items-center gap-2">Pagar ${total.toFixed(2)} <ChevronRight size={20} /></span>
          </Button>
        </div>
      )}

      {/* Diálogo de Pago Mejorado */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-primary p-8 text-white">
            <DialogTitle className="text-3xl font-black">Método de Pago</DialogTitle>
            <DialogDescription className="text-white/80 font-medium">Selecciona cómo deseas pagar tu pedido.</DialogDescription>
          </div>
          
          <div className="p-8 space-y-6">
            {!paymentMethod ? (
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 rounded-2xl flex items-center justify-start gap-4 px-6 border-2 hover:border-primary hover:bg-primary/5 group transition-all"
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <CreditCard size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black">Transferencia</p>
                    <p className="text-xs text-muted-foreground">Pago electrónico inmediato</p>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 rounded-2xl flex items-center justify-start gap-4 px-6 border-2 hover:border-primary hover:bg-primary/5 group transition-all"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Wallet size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black">Efectivo en Caja</p>
                    <p className="text-xs text-muted-foreground">Paga al recoger tu comida</p>
                  </div>
                </Button>
              </div>
            ) : paymentMethod === 'transfer' ? (
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-3xl border-2 border-dashed border-primary/20 text-center">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Clave Interbancaria (CLABE)</p>
                  <p className="text-2xl font-black tracking-widest text-primary">0123 4567 8901 2345 67</p>
                  <Badge variant="outline" className="mt-4 border-primary/20 text-primary font-bold">Banco: UNI-BANK</Badge>
                </div>
                <div className="flex justify-between items-center text-xl font-black">
                  <span>Total a Transferir</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setPaymentMethod(null)}>Atrás</Button>
                   <Button className="h-14 flex-[2] rounded-2xl font-black shadow-lg" onClick={() => handlePayment('transfer')}>Ya realicé el pago</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-8 bg-emerald-50 rounded-3xl border-2 border-emerald-100 text-center space-y-3">
                  <Banknote className="mx-auto text-emerald-600 h-12 w-12" />
                  <p className="font-bold text-emerald-800">Has elegido pagar en efectivo.</p>
                  <p className="text-sm text-emerald-700">Por favor, ten listo tu dinero para pagar al recoger tu pedido en la caja.</p>
                </div>
                <div className="flex justify-between items-center text-xl font-black">
                  <span>Total a Pagar</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setPaymentMethod(null)}>Atrás</Button>
                   <Button className="h-14 flex-[2] rounded-2xl font-black shadow-lg" onClick={() => handlePayment('cash')}>Confirmar Pedido</Button>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-center text-muted-foreground font-bold italic">
              * Todos los pedidos son monitoreados por el personal de staff.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Calificación y Feedback */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-md">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
              <Star size={40} fill="currentColor" />
            </div>
            <DialogTitle className="text-3xl font-black">¿Qué tal te pareció el servicio?</DialogTitle>
            <DialogDescription className="text-lg font-medium">Tu opinión nos ayuda a mejorar la experiencia en UniEats.</DialogDescription>
            
            <div className="flex justify-center gap-2 py-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    size={42} 
                    className={cn(
                      "transition-colors",
                      star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                    )} 
                  />
                </button>
              ))}
            </div>

            <textarea 
              placeholder="Escribe un comentario opcional..." 
              className="w-full p-4 rounded-2xl bg-muted border-none min-h-[100px] text-sm font-medium focus:ring-2 focus:ring-primary/20"
            />

            <Button 
              className="w-full h-14 rounded-2xl font-black text-lg"
              onClick={() => {
                setShowFeedback(false);
                setOrderStatus('idle');
                toast({
                  title: "🙏 ¡Gracias!",
                  description: "Tu comentario ha sido enviado correctamente.",
                });
              }}
            >
              Enviar Calificación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
