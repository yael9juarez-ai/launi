
'use client';

import { useState, useMemo } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  ChevronRight,
  Trash2,
  Loader2,
  UtensilsCrossed,
  CreditCard,
  Wallet,
  MessageSquare,
  MapPin,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useUser, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signOut } from 'firebase/auth';

export default function ClientMenu() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellRecommendations, setUpsellRecommendations] = useState<any[]>([]);
  const [upsellTitle, setUpsellTitle] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | null>(null);
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const accountNumber = useMemo(() => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }, []);

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'ingredients');
  }, [firestore, user]);
  
  const { data: inventory, isLoading: isInvLoading } = useCollection(ingredientsQuery);

  const checkStockAvailability = (newItem: MenuItem, currentCart: any[]) => {
    if (!inventory) return true;
    const requirements: Record<string, number> = {};
    [...currentCart, newItem].forEach(cartItem => {
      cartItem.recipe.forEach((r: any) => {
        requirements[r.ingredientId] = (requirements[r.ingredientId] || 0) + r.quantity;
      });
    });
    return Object.entries(requirements).every(([ingId, qty]) => {
      const ing = inventory.find((i: any) => i.id === ingId);
      return !ing || ing.currentStock >= qty;
    });
  };

  const getSimpleRecommendations = (item: MenuItem) => {
    let targetCategories: string[] = [];
    let title = "¿No quieres agregar algo más?";

    if (item.category === "Comida") {
      targetCategories = ["Bebidas", "Golosinas"];
      title = "¿Te gustaría una bebida o algo dulce para acompañar?";
    } else if (item.category === "Bebidas") {
      targetCategories = ["Comida", "Golosinas"];
      title = "¿Hambre? ¡Mira estas opciones para tu bebida!";
    } else if (item.category === "Golosinas") {
      targetCategories = ["Bebidas", "Comida"];
      title = "¿Algo para acompañar tu antojo?";
    }

    const suggestions = MENU_ITEMS.filter(m => 
      targetCategories.includes(m.category) && 
      m.id !== item.id &&
      !cart.some(cartItem => cartItem.id === m.id) &&
      checkStockAvailability(m, cart)
    ).sort(() => 0.5 - Math.random()).slice(0, 2);

    if (suggestions.length > 0) {
      setUpsellRecommendations(suggestions);
      setUpsellTitle(title);
      setShowUpsell(true);
    }
  };

  const addToCart = (item: any, silent = false) => {
    if (!checkStockAvailability(item, cart)) {
      toast({ variant: "destructive", title: "🚫 AGOTADO", description: `Sin insumos para ${item.name}.` });
      return;
    }
    setCart(prev => [...prev, item]);
    if (!silent) {
      toast({ className: "uni-toast-info", title: "AÑADIDO", description: `${item.name} en el carrito.` });
      getSimpleRecommendations(item);
    } else {
      setShowUpsell(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handlePayment = async () => {
    if (!user || cart.length === 0 || !paymentMethod) return;
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const orderId = `${Math.floor(100 + Math.random() * 899)}`;

    const orderRef = doc(firestore, 'orders', orderId);
    await setDoc(orderRef, {
      id: orderId,
      userId: user.uid,
      user: user.displayName || 'Estudiante',
      totalAmount,
      status: 'Pending',
      method: paymentMethod,
      orderDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      items: cart.reduce((acc: any[], item) => {
        const ex = acc.find(i => i.name === item.name);
        if (ex) ex.qty += 1; else acc.push({ name: item.name, qty: 1, price: item.price });
        return acc;
      }, [])
    });

    cart.forEach(cartItem => {
      cartItem.recipe.forEach((r: any) => {
        const ing = inventory?.find(i => i.id === r.ingredientId);
        if (ing) {
          const ingRef = doc(firestore, 'ingredients', ing.id);
          updateDocumentNonBlocking(ingRef, {
            currentStock: ing.currentStock - r.quantity,
            updatedAt: serverTimestamp()
          });
        }
      });
    });

    setCart([]);
    setShowPayment(false);
    setPaymentMethod(null);
    toast({ className: "uni-toast-success", title: "PEDIDO REALIZADO", description: `Orden #${orderId} enviada a cocina.` });
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (isUserLoading || (user && isInvLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      <header className="bg-white border-b-2 sticky top-0 z-40 px-4 md:px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 mcd-gradient rounded-xl flex items-center justify-center text-white"><UtensilsCrossed size={20} /></div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-primary leading-tight">UniEats</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{user?.displayName || 'Alumno'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => { if(cart.length > 0) setShowPayment(true) }}>
             <ShoppingCart size={24} />
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
           </Button>
           <Button variant="outline" className="rounded-xl h-10 font-black gap-2 border-2 text-xs" onClick={handleLogout}>SALIR</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-primary/5 p-4 rounded-3xl mb-8 border border-primary/10 flex items-center gap-4">
            <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20"><MapPin size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ubicación Actual</p>
              <p className="text-lg font-black tracking-tight">Plantel La Uni: Sevilla Toledo 39</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute left-5 top-5 h-6 w-6 text-muted-foreground" />
              <Input 
                placeholder="Busca tu comida favorita..." 
                className="pl-16 h-16 bg-white border-2 rounded-2xl text-xl font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {["Todas", ...CATEGORIES].map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "secondary"} onClick={() => setSelectedCategory(cat)} className="rounded-full h-12 px-8 font-black whitespace-nowrap">{cat}</Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MENU_ITEMS.filter(item => (selectedCategory === "Todas" || item.category === selectedCategory) && item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
            const avail = checkStockAvailability(item, cart);
            return (
              <Card key={item.id} className={cn("group border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1", !avail && "opacity-50 grayscale")}>
                <div className="aspect-video relative overflow-hidden">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 25vw" />
                  <div className="absolute top-4 right-4 bg-secondary text-black h-10 px-4 rounded-full text-lg font-black flex items-center shadow-xl">$ {item.price.toFixed(2)}</div>
                </div>
                <CardHeader className="p-6">
                  <p className="text-[10px] font-black text-primary uppercase mb-1">{item.category}</p>
                  <CardTitle className="text-xl font-black line-clamp-1">{item.name}</CardTitle>
                </CardHeader>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-lg" onClick={() => addToCart(item)} disabled={!avail}>{avail ? 'Añadir al Carrito' : 'Agotado'}</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-50 flex gap-3">
          <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full shadow-2xl border-4 border-white" onClick={() => setCart([])}><Trash2 size={24} /></Button>
          <Button className="flex-1 h-16 rounded-2xl shadow-2xl text-lg font-black flex justify-between px-8 mcd-gradient" onClick={() => setShowPayment(true)}>
            <span>{cart.length} productos</span>
            <span className="flex items-center gap-2">PEDIR $ {total.toFixed(2)} <ChevronRight size={24} /></span>
          </Button>
        </div>
      )}

      <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-w-lg">
          <DialogHeader className="bg-secondary p-8 text-black">
            <DialogTitle className="text-3xl font-black flex items-center gap-3">
              <Sparkles className="text-primary" /> Sugerencia Especial
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-white">
            <p className="font-black text-xl leading-tight text-center">{upsellTitle}</p>
            <div className="space-y-4">
              {upsellRecommendations.map((rec: any) => (
                <div key={rec.id} className="flex gap-4 p-4 rounded-3xl border-2 hover:border-primary/20 transition-all bg-muted/10">
                  <div className="w-24 h-24 relative rounded-2xl overflow-hidden shrink-0 shadow-md">
                    <Image src={rec.imageUrl} alt={rec.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase">{rec.category}</p>
                      <p className="font-black text-lg leading-tight">{rec.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-black text-xl">$ {rec.price.toFixed(2)}</p>
                      <Button size="sm" className="rounded-full font-black mcd-gradient px-6" onClick={() => addToCart(rec, true)}>Añadir</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-muted-foreground hover:bg-muted/50" onClick={() => setShowUpsell(false)}>No, gracias. Así estoy bien.</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={(open) => { setShowPayment(open); if(!open) setPaymentMethod(null); }}>
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <DialogHeader className="bg-primary p-8 text-white">
            <DialogTitle className="text-3xl font-black">Finalizar Pedido</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            {!paymentMethod ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-muted-foreground uppercase text-center mb-2">Selecciona tu método de pago</p>
                <Button variant="outline" className="h-24 w-full rounded-2xl flex items-center justify-start gap-5 px-8 border-2 hover:bg-primary/5 hover:border-primary transition-all group" onClick={() => setPaymentMethod('transfer')}>
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20"><CreditCard size={28} className="text-primary" /></div>
                  <div className="text-left">
                    <p className="font-black text-lg">Transferencia / QR</p>
                    <p className="text-[10px] font-bold text-muted-foreground">Pago digital instantáneo</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-24 w-full rounded-2xl flex items-center justify-start gap-5 px-8 border-2 hover:bg-secondary/5 hover:border-secondary transition-all group" onClick={() => setPaymentMethod('cash')}>
                  <div className="bg-secondary/10 p-3 rounded-xl group-hover:bg-secondary/20"><Wallet size={28} className="text-secondary" /></div>
                  <div className="text-left">
                    <p className="font-black text-lg">Efectivo en Caja</p>
                    <p className="text-[10px] font-bold text-muted-foreground">Paga al recoger en ventanilla</p>
                  </div>
                </Button>
              </div>
            ) : paymentMethod === 'transfer' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-muted/30 p-6 rounded-3xl border-2 border-dashed border-primary/20 text-center">
                  <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4 border-2">
                    <Image src="https://picsum.photos/seed/qr-code/200/200" alt="QR de Pago" width={160} height={160} className="rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cuenta CLABE</p>
                    <p className="text-xl font-black text-primary tracking-wider">{accountNumber}</p>
                    <p className="text-[10px] font-bold">Banco: UniEats Digital</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                  <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-lg"><MessageSquare size={20} /></div>
                  <div>
                    <p className="text-xs font-black text-emerald-900 uppercase">INSTRUCCIÓN</p>
                    <p className="text-[11px] font-medium text-emerald-800 leading-tight">Envía tu comprobante al WhatsApp: <span className="font-black">+52 55 1234 5678</span> con tu número de pedido.</p>
                  </div>
                </div>

                <Button variant="ghost" className="w-full text-xs font-black text-muted-foreground" onClick={() => setPaymentMethod(null)}>Cambiar método de pago</Button>
              </div>
            ) : (
              <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg"><Wallet size={32} /></div>
                <div className="space-y-1">
                  <p className="font-black text-lg text-amber-900 leading-tight">Pago en Efectivo</p>
                  <p className="text-[11px] font-medium text-amber-800">Tu pedido entrará a cocina una vez que realices el pago en la caja central.</p>
                </div>
                <Button variant="ghost" className="w-full text-xs font-black text-amber-900/50" onClick={() => setPaymentMethod(null)}>Cambiar método de pago</Button>
              </div>
            )}
            
            <div className="flex justify-between items-center text-3xl font-black border-t-4 pt-6">
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Total</span> 
              <span className="text-primary">$ {total.toFixed(2)}</span>
            </div>
            
            <Button className="w-full h-16 rounded-2xl text-xl font-black mcd-gradient shadow-xl" onClick={handlePayment} disabled={!paymentMethod}>
              {paymentMethod === 'transfer' ? 'CONFIRMAR Y ENVIAR' : 'PEDIR AHORA'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
