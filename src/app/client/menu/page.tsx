
"use client";

import { useState, useMemo, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem, Ingredient, INGREDIENTS } from '@/lib/data';
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
  const [userName, setUserName] = useState("Comunidad UNI");
  
  const { toast } = useToast();
  const router = useRouter();

  const syncInventory = () => {
    const savedInv = localStorage.getItem('uni_inventory');
    const parsedInv = savedInv ? JSON.parse(savedInv) : [];
    // Verificamos si los nuevos ingredientes de botellas están presentes
    const needsUpdate = !parsedInv.find((i: any) => i.id === 'i14' && i.unit === 'pzas');

    if (!savedInv || needsUpdate) {
      setInventory(INGREDIENTS);
      localStorage.setItem('uni_inventory', JSON.stringify(INGREDIENTS));
    } else {
      setInventory(parsedInv);
    }
  };

  useEffect(() => {
    syncInventory();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uni_inventory') syncInventory();
    };
    window.addEventListener('storage', handleStorageChange);

    const savedUser = localStorage.getItem('unieats_user');
    if (savedUser) setUserName(JSON.parse(savedUser).name);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkStockAvailability = (newItem: MenuItem, currentCart: any[]) => {
    const savedInv = localStorage.getItem('uni_inventory');
    const currentInv = savedInv ? JSON.parse(savedInv) : inventory;
    
    if (currentInv.length === 0) return false;

    const requirements: Record<string, number> = {};
    
    currentCart.forEach(cartItem => {
      cartItem.recipe.forEach((r: any) => {
        requirements[r.ingredientId] = (requirements[r.ingredientId] || 0) + r.quantity;
      });
    });

    newItem.recipe.forEach((r: any) => {
      requirements[r.ingredientId] = (requirements[r.ingredientId] || 0) + r.quantity;
    });

    return Object.entries(requirements).every(([ingId, qty]) => {
      const ing = currentInv.find((i: any) => i.id === ingId);
      return ing && ing.stock >= qty;
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
    if (!checkStockAvailability(item, cart)) {
      toast({
        variant: "destructive",
        title: "🚫 INSUMOS AGOTADOS",
        description: `No hay suficientes unidades para este pedido.`,
      });
      return;
    }

    setCart([...cart, item]);
    
    if (item.category === "Comida" && upsellStep === 'none') {
      setUpsellStep('drink');
    }

    toast({
      className: "uni-toast-info",
      title: "AÑADIDO AL CARRITO",
      description: `${item.name} listo para ordenar.`,
    });
  };

  const clearCart = () => {
    setCart([]);
    setUpsellStep('none');
    setPaymentMethod(null);
    setShowPayment(false);
  };

  const nextUpsell = () => {
    if (upsellStep === 'drink') setUpsellStep('sweet');
    else setUpsellStep('none');
  };

  const handlePayment = () => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const orderId = `#${Math.floor(100 + Math.random() * 900)}`;
    setCurrentOrderId(orderId);

    const savedInv = localStorage.getItem('uni_inventory');
    const currentInv = savedInv ? JSON.parse(savedInv) : [...inventory];
    const newInventory = currentInv.map((ing: any) => ({ ...ing }));

    cart.forEach(cartItem => {
      cartItem.recipe.forEach((r: any) => {
        const ingIndex = newInventory.findIndex((i: any) => i.id === r.ingredientId);
        if (ingIndex !== -1) {
          newInventory[ingIndex].stock -= r.quantity;
        }
      });
    });

    localStorage.setItem('uni_inventory', JSON.stringify(newInventory));
    setInventory(newInventory);
    
    window.dispatchEvent(new StorageEvent('storage', { key: 'uni_inventory' }));

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
      user: userName,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('kitchen_orders', JSON.stringify(kitchenOrders));

    const pendingVerifications = JSON.parse(localStorage.getItem('pending_verifications') || '[]');
    pendingVerifications.push({
      id: orderId,
      user: userName,
      total: totalAmount,
      method: paymentMethod,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price })),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pending_verifications', JSON.stringify(pendingVerifications));

    toast({
      className: "uni-toast-info",
      title: `ORDEN ${orderId} ENVIADA`,
      description: "Insumos descontados. Pasa a ventanilla.",
    });

    setShowPayment(false);
    setCart([]);
    setOrderStatus('preparing');
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      <header className="bg-white border-b-2 sticky top-0 z-40 px-4 md:px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => router.push('/login')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-primary">UniEats</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{userName}</span>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl h-10 px-4 font-black gap-2 border-2 text-xs" onClick={() => router.push('/queue')}>
          <Tv size={16} className="text-primary" /> TURNOS
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8">
        {orderStatus !== 'idle' && (
          <div className={cn(
            "mb-8 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-2xl text-white mcd-gradient animate-in slide-in-from-top duration-500",
            orderStatus === 'ready' && "bg-emerald-500 bg-none"
          )}>
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {orderStatus === 'preparing' ? <Clock className="w-8 h-8 animate-spin" /> : <CheckCircle2 className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-80">ORDEN {currentOrderId}</p>
                <p className="text-2xl font-black">
                  {orderStatus === 'preparing' ? '¡PREPARANDO!' : '¡LISTO!'}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full md:w-auto bg-white/10 text-white border-2 rounded-xl h-14 px-8 font-black text-lg" onClick={() => { setOrderStatus('idle'); setCurrentOrderId(null); }}>
              {orderStatus === 'ready' ? 'ENTENDIDO' : 'CANCELAR'}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-6 mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-5 h-6 w-6 text-muted-foreground" />
            <Input 
              placeholder="¿Qué vas a comer hoy?" 
              className="pl-16 h-16 bg-white border-2 rounded-2xl text-xl font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {["Todas", ...CATEGORIES].map(cat => (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? "default" : "secondary"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full h-12 px-8 font-black text-sm whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const available = checkStockAvailability(item, cart);
            return (
              <Card key={item.id} className={cn("group border-none shadow-xl rounded-[2rem] overflow-hidden bg-white flex flex-col transition-all active:scale-95", !available && "opacity-50 grayscale")}>
                <div className="aspect-[16/9] relative overflow-hidden shrink-0">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={item.id === 'm7' || item.id === 'm2'}
                  />
                  <div className="absolute top-4 right-4 bg-secondary text-black h-10 px-4 rounded-full text-lg font-black flex items-center justify-center shadow-xl">
                    $ {item.price.toFixed(2)}
                  </div>
                </div>
                <CardHeader className="p-6 flex-1">
                  <p className="text-[10px] font-black text-primary uppercase mb-1">{item.category}</p>
                  <CardTitle className="text-xl font-black line-clamp-1">{item.name}</CardTitle>
                  <CardDescription className="line-clamp-2 font-medium mt-1 text-sm">{item.description}</CardDescription>
                </CardHeader>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button className="w-full h-14 rounded-xl font-black text-lg" onClick={() => addToCart(item)} disabled={!available}>
                    {available ? 'Añadir' : 'Agotado'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-50 flex gap-3">
          <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full shadow-2xl shrink-0 border-4 border-white" onClick={clearCart}>
            <Trash2 size={24} />
          </Button>
          <Button className="flex-1 h-16 rounded-2xl shadow-2xl text-lg font-black flex justify-between px-8 mcd-gradient" onClick={() => setShowPayment(true)}>
            <span>{cart.length} items</span>
            <span className="flex items-center gap-2">PAGAR $ {total.toFixed(2)} <ChevronRight size={24} /></span>
          </Button>
        </div>
      )}

      {/* Ventana de Pago */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md mx-4">
          <div className="bg-primary p-8 text-white">
            <h2 className="text-3xl font-black">Finalizar Pago</h2>
          </div>
          <div className="p-8 space-y-4">
            <Button variant="outline" className={cn("h-20 w-full rounded-2xl flex items-center justify-start gap-4 px-6 border-2", paymentMethod === 'transfer' && "border-primary bg-primary/5")}
                    onClick={() => setPaymentMethod('transfer')}>
              <CreditCard size={24} />
              <p className="font-black text-lg">Transferencia / QR</p>
            </Button>
            <Button variant="outline" className={cn("h-20 w-full rounded-2xl flex items-center justify-start gap-4 px-6 border-2", paymentMethod === 'cash' && "border-primary bg-primary/5")}
                    onClick={() => setPaymentMethod('cash')}>
              <Wallet size={24} />
              <p className="font-black text-lg">Efectivo en Ventanilla</p>
            </Button>
            <div className="flex justify-between items-center text-3xl font-black border-t-4 pt-4 mt-4">
              <span>Total</span>
              <span className="text-primary">$ {total.toFixed(2)}</span>
            </div>
            <Button className="w-full h-16 rounded-xl text-xl font-black mcd-gradient shadow-lg" onClick={handlePayment} disabled={!paymentMethod}>
              Confirmar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
