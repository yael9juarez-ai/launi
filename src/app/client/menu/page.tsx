
"use client";

import { useState, useMemo, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem, Ingredient } from '@/lib/data';
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
  Plus,
  Sparkles,
  Utensils,
  XCircle,
  Trash2,
  RotateCcw,
  LayoutDashboard,
  Tv
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
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('uni_inventory');
    if (saved) setInventory(JSON.parse(saved));
  }, []);

  const checkStockAvailability = (item: MenuItem, currentCart: any[] = cart) => {
    const itemCountInCart = currentCart.filter(i => i.id === item.id).length;
    return item.recipe.every(r => {
      const ing = inventory.find(i => i.id === r.ingredientId);
      return ing && ing.stock >= (r.quantity * (itemCountInCart + 1));
    });
  };

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === "Todas" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const drinkUpsells = useMemo(() => MENU_ITEMS.filter(item => item.category === "Bebidas").slice(0, 4), []);
  const sweetUpsells = useMemo(() => MENU_ITEMS.filter(item => item.category === "Golosinas").slice(0, 4), []);

  const addToCart = (item: any) => {
    if (!checkStockAvailability(item)) {
      toast({
        variant: "destructive",
        title: "🚫 PRODUCTO AGOTADO",
        description: "Lo sentimos, no hay insumos suficientes para este producto.",
      });
      return;
    }

    setCart([...cart, item]);
    
    if (item.category === "Comida" && upsellStep === 'none') {
      setUpsellStep('drink');
    }

    toast({
      className: "uni-toast-info",
      title: "🍔 ¡AÑADIDO!",
      description: `${item.name} listo en tu carrito.`,
    });
  };

  const clearCart = () => {
    setCart([]);
    setUpsellStep('none');
    setPaymentMethod(null);
    setShowPayment(false);
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
    setCurrentOrderId(orderId);

    // 1. DEDUCIR INVENTARIO GLOBAL
    const newInventory = [...inventory];
    cart.forEach(cartItem => {
        cartItem.recipe.forEach((r: any) => {
            const ingIndex = newInventory.findIndex(i => i.id === r.ingredientId);
            if (ingIndex !== -1) {
                newInventory[ingIndex].stock -= r.quantity;
            }
        });
    });
    localStorage.setItem('uni_inventory', JSON.stringify(newInventory));
    setInventory(newInventory);

    // 2. Enviar a Cocina
    const kitchenOrders = JSON.parse(localStorage.getItem('kitchen_orders') || '[]');
    kitchenOrders.push({
      id: orderId,
      items: cart.reduce((acc: any[], item) => {
        const existing = acc.find(i => i.name === item.name);
        if (existing) existing.qty += 1;
        else acc.push({ name: item.name, qty: 1 });
        return acc;
      }, []),
      status: 'pending',
      time: '1m',
      user: "Comunidad UNI",
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('kitchen_orders', JSON.stringify(kitchenOrders));

    // 3. Enviar a Verificación de Administrador
    const pendingVerifications = JSON.parse(localStorage.getItem('pending_verifications') || '[]');
    pendingVerifications.push({
      id: orderId,
      user: "Comunidad UNI",
      total: totalAmount,
      method: paymentMethod,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price })),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pending_verifications', JSON.stringify(pendingVerifications));

    toast({
      className: "uni-toast-info",
      title: `ORDEN ${orderId}`,
      description: paymentMethod === 'cash' ? "Paga en caja. Tu orden ya se está preparando." : "Verificaremos tu transferencia pronto.",
    });

    setShowPayment(false);
    setCart([]);
    setOrderStatus('preparing');
  };

  const handleCancelOrder = () => {
    if (!currentOrderId) return;
    
    // Eliminar de cocina
    const kitchenOrders = JSON.parse(localStorage.getItem('kitchen_orders') || '[]');
    const updatedKitchen = kitchenOrders.filter((o: any) => o.id !== currentOrderId);
    localStorage.setItem('kitchen_orders', JSON.stringify(updatedKitchen));

    // Eliminar de verificaciones pendientes
    const pending = JSON.parse(localStorage.getItem('pending_verifications') || '[]');
    const updatedPending = pending.filter((o: any) => o.id !== currentOrderId);
    localStorage.setItem('pending_verifications', JSON.stringify(updatedPending));

    setOrderStatus('idle');
    setCurrentOrderId(null);
    toast({
      variant: "destructive",
      title: "🚫 PEDIDO CANCELADO",
      description: "Tu orden ha sido eliminada del sistema.",
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      <header className="bg-white border-b-2 sticky top-0 z-40 px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-primary/10" onClick={() => router.push('/login')}>
            <ArrowLeft size={24} />
          </Button>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-primary">UniEats</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Campus Selection</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl h-12 px-5 font-black gap-2 border-2 hidden md:flex" onClick={() => router.push('/queue')}>
            <Tv size={20} className="text-primary" /> VER TURNOS
          </Button>
          <Button variant="ghost" size="icon" className="relative h-14 w-14 rounded-2xl bg-muted/50">
            <ShoppingCart size={28} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-black text-xs w-6 h-6 flex items-center justify-center rounded-full font-black border-2 border-white shadow-lg animate-bounce">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {orderStatus !== 'idle' && (
          <div className={cn(
            "mb-10 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between shadow-2xl text-white mcd-gradient animate-in slide-in-from-top duration-500",
            orderStatus === 'ready' && "bg-emerald-500 bg-none"
          )}>
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center">
                {orderStatus === 'preparing' ? <Clock className="w-10 h-10 animate-spin" /> : <CheckCircle2 className="w-10 h-10" />}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest opacity-80">ESTADO ORDEN {currentOrderId}</p>
                <p className="text-4xl font-black">
                  {orderStatus === 'preparing' ? '¡ESTAMOS COCINANDO!' : '¡TU ORDEN ESTÁ LISTA!'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              {orderStatus === 'preparing' && (
                <Button 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 rounded-2xl h-16 px-8 font-black text-xl gap-2"
                  onClick={handleCancelOrder}
                >
                  <XCircle size={24} /> CANCELAR
                </Button>
              )}
              {orderStatus === 'ready' && (
                <Button 
                  className="bg-white text-emerald-600 hover:bg-white/90 rounded-2xl h-16 px-8 font-black text-xl gap-2 shadow-xl"
                  onClick={() => {
                    setOrderStatus('idle');
                    setCurrentOrderId(null);
                  }}
                >
                  <RotateCcw size={24} /> NUEVO PEDIDO
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8 mb-12">
          <div className="relative">
            <Search className="absolute left-6 top-5 h-6 w-6 text-muted-foreground" />
            <Input 
              placeholder="¿Qué te gustaría comer hoy?" 
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
                  "rounded-full h-14 px-10 font-black text-lg shadow-sm whitespace-nowrap",
                  selectedCategory === cat ? "scale-105 shadow-xl shadow-primary/20" : "hover:bg-muted"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredItems.map((item) => {
            const available = checkStockAvailability(item);
            return (
              <Card key={item.id} className={cn(
                "group border-none shadow-xl rounded-[3rem] overflow-hidden bg-white mcd-card-hover",
                !available && "opacity-50 grayscale"
              )}>
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
                  {!available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-xl h-12 px-8 rounded-full font-black animate-pulse">AGOTADO</Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="p-8">
                  <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-2">{item.category}</p>
                  <CardTitle className="text-2xl font-black">{item.name}</CardTitle>
                  <CardDescription className="text-base font-medium leading-relaxed mt-2 line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardFooter className="p-8 pt-0">
                  <Button 
                    className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all" 
                    onClick={() => addToCart(item)}
                    disabled={!available}
                  >
                    {available ? 'Añadir al Carrito' : 'Insumos Agotados'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 flex gap-4">
          <Button 
            variant="destructive"
            size="icon"
            className="h-20 w-20 rounded-full shadow-2xl shrink-0 border-4 border-white"
            onClick={clearCart}
          >
            <Trash2 size={32} />
          </Button>
          <Button 
            className="flex-1 h-20 rounded-[2.5rem] shadow-2xl text-2xl font-black flex justify-between px-10 mcd-gradient border-none transition-all hover:scale-[1.02] active:scale-95"
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
              <DialogTitle className="text-4xl font-black text-center">
                {upsellStep === 'drink' ? '¿Quieres agregar una bebida?' : '¿Deseas agregar una golosina?'}
              </DialogTitle>
              <DialogDescription className="text-xl font-medium text-center">
                {upsellStep === 'drink' 
                  ? 'Refréscate con una de nuestras bebidas recién preparadas.' 
                  : '¡El toque dulce perfecto para terminar tu comida!'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {(upsellStep === 'drink' ? drinkUpsells : sweetUpsells).map(item => {
                const available = checkStockAvailability(item);
                return (
                  <Card 
                    key={item.id} 
                    className={cn(
                      "border-2 border-muted hover:border-secondary transition-all rounded-3xl overflow-hidden p-0 group cursor-pointer flex flex-col",
                      !available && "opacity-40 grayscale pointer-events-none"
                    )} 
                    onClick={() => {
                      setCart([...cart, item]);
                      nextUpsell();
                    }}
                  >
                    <div className="aspect-video relative">
                      <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                      {!available && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Badge variant="destructive">AGOTADO</Badge></div>}
                    </div>
                    <div className="p-4 text-center flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-black text-lg line-clamp-1">{item.name}</p>
                        <p className="text-secondary font-black text-xl">$ {item.price.toFixed(2)}</p>
                      </div>
                      <Button variant="secondary" className="w-full mt-3 rounded-xl font-black gap-2" disabled={!available}>
                        <Plus size={18} /> AÑADIR
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button variant="ghost" className="text-muted-foreground font-black text-lg" onClick={nextUpsell}>
              {upsellStep === 'drink' ? 'No, gracias. Ver golosinas.' : 'Continuar con mi orden.'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-primary p-10 text-white">
            <h2 className="text-4xl font-black">Finalizar Pedido</h2>
            <p className="text-white/80 font-medium text-lg mt-2">Elige tu método de pago favorito.</p>
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

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground font-bold"
              onClick={clearCart}
            >
              Descartar todo y empezar de nuevo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
