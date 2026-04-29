
'use client';

import { useState } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  UtensilsCrossed,
  CreditCard,
  Wallet
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
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | null>(null);
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

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
    if (item.category === "Comida") targetCategories = ["Bebidas", "Golosinas"];
    else if (item.category === "Bebidas") targetCategories = ["Comida", "Golosinas"];
    else if (item.category === "Golosinas") targetCategories = ["Bebidas", "Comida"];

    const suggestions = MENU_ITEMS.filter(m => 
      targetCategories.includes(m.category) && 
      m.id !== item.id &&
      !cart.some(cartItem => cartItem.id === m.id) &&
      checkStockAvailability(m, cart)
    ).sort(() => 0.5 - Math.random()).slice(0, 2);

    if (suggestions.length > 0) {
      setUpsellRecommendations(suggestions);
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
        <Button variant="outline" className="rounded-xl h-10 font-black gap-2 border-2 text-xs" onClick={handleLogout}>SALIR</Button>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 mb-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MENU_ITEMS.filter(item => (selectedCategory === "Todas" || item.category === selectedCategory) && item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
            const avail = checkStockAvailability(item, cart);
            return (
              <Card key={item.id} className={cn("group border-none shadow-xl rounded-[2rem] overflow-hidden bg-white flex flex-col transition-all", !avail && "opacity-50 grayscale")}>
                <div className="aspect-video relative overflow-hidden">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 25vw" />
                  <div className="absolute top-4 right-4 bg-secondary text-black h-10 px-4 rounded-full text-lg font-black flex items-center shadow-xl">$ {item.price.toFixed(2)}</div>
                </div>
                <CardHeader className="p-6">
                  <p className="text-[10px] font-black text-primary uppercase mb-1">{item.category}</p>
                  <CardTitle className="text-xl font-black line-clamp-1">{item.name}</CardTitle>
                </CardHeader>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button className="w-full h-14 rounded-xl font-black text-lg" onClick={() => addToCart(item)} disabled={!avail}>{avail ? 'Añadir' : 'Agotado'}</Button>
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
            <span>{cart.length} items</span>
            <span className="flex items-center gap-2">PAGAR $ {total.toFixed(2)} <ChevronRight size={24} /></span>
          </Button>
        </div>
      )}

      <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-lg">
          <div className="bg-secondary p-8 text-black"><h2 className="text-3xl font-black">¿No quieres agregar algo más?</h2></div>
          <div className="p-8 space-y-4 bg-white">
            {upsellRecommendations.map((rec: any) => (
              <div key={rec.id} className="flex gap-4 p-4 rounded-3xl border-2 hover:border-primary/20 transition-all">
                <div className="w-20 h-20 relative rounded-2xl overflow-hidden shrink-0"><Image src={rec.imageUrl} alt={rec.name} fill className="object-cover" sizes="80px" /></div>
                <div className="flex-1">
                  <p className="font-black text-lg leading-tight">{rec.name}</p>
                  <p className="text-primary font-black text-xl mt-1">$ {rec.price.toFixed(2)}</p>
                  <Button size="sm" className="w-full mt-2 rounded-full font-black mcd-gradient" onClick={() => addToCart(rec, true)}>+ AÑADIR</Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-muted-foreground" onClick={() => setShowUpsell(false)}>No por ahora</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-primary p-8 text-white"><h2 className="text-3xl font-black">Finalizar Pedido</h2></div>
          <div className="p-8 space-y-4">
            <Button variant="outline" className={cn("h-20 w-full rounded-2xl flex items-center justify-start gap-4 px-6 border-2", paymentMethod === 'transfer' && "border-primary bg-primary/5")} onClick={() => setPaymentMethod('transfer')}><CreditCard size={24} /> <p className="font-black">Transferencia / QR</p></Button>
            <Button variant="outline" className={cn("h-20 w-full rounded-2xl flex items-center justify-start gap-4 px-6 border-2", paymentMethod === 'cash' && "border-primary bg-primary/5")} onClick={() => setPaymentMethod('cash')}><Wallet size={24} /> <p className="font-black">Efectivo en Caja</p></Button>
            <div className="flex justify-between items-center text-3xl font-black border-t-4 pt-4"><span>Total</span> <span className="text-primary">$ {total.toFixed(2)}</span></div>
            <Button className="w-full h-16 rounded-xl text-xl font-black mcd-gradient" onClick={handlePayment} disabled={!paymentMethod}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
