
'use client';

import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Sparkles,
  Star,
  Clock,
  CheckCircle2,
  Flame,
  Printer,
  Tag,
  Plus,
  Minus
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useUser, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, query, where, limit, writeBatch, increment } from 'firebase/firestore';
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
  
  // Ticket State
  const [showTicket, setShowTicket] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  // Rating State
  const [showRating, setShowRating] = useState(false);
  const [serviceRating, setServiceRating] = useState(0);
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const [orderToRate, setOrderToRate] = useState<any>(null);

  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const accountNumber = useMemo(() => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }, []);

  const menuQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'menu_items');
  }, [firestore, user]);

  const reviewsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'product_reviews');
  }, [firestore, user]);

  const { data: menuItems, isLoading: isMenuLoading } = useCollection(menuQuery);
  const { data: allReviews, isLoading: isReviewsLoading } = useCollection(reviewsQuery);

  const productAverages = useMemo(() => {
    if (!allReviews) return {};
    const stats: Record<string, { sum: number, count: number }> = {};
    allReviews.forEach(rev => {
      const name = rev.menuItemName;
      if (!stats[name]) stats[name] = { sum: 0, count: 0 };
      stats[name].sum += rev.rating;
      stats[name].count += 1;
    });
    
    const averages: Record<string, number> = {};
    Object.keys(stats).forEach(name => {
      averages[name] = stats[name].sum / stats[name].count;
    });
    return averages;
  }, [allReviews]);

  const activeOrdersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'orders'),
      where('userId', '==', user.uid),
      limit(10)
    );
  }, [firestore, user]);

  const { data: userOrdersRaw } = useCollection(activeOrdersQuery);

  const userOrders = useMemo(() => {
    if (!userOrdersRaw) return [];
    return [...userOrdersRaw].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [userOrdersRaw]);

  useEffect(() => {
    if (userOrders && userOrders.length > 0) {
      const justDelivered = userOrders.find(o => o.status === 'Picked Up' && (o.isRated === false || o.isRated === undefined));
      if (justDelivered && !showRating && !orderToRate) {
        setOrderToRate(justDelivered);
        setShowRating(true);
      }
    }
  }, [userOrders, showRating, orderToRate]);

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'ingredients');
  }, [firestore, user]);
  
  const { data: inventory, isLoading: isInvLoading } = useCollection(ingredientsQuery);

  const checkStockAvailability = (newItem: any, currentCart: any[], qtyToAdd: number = 1) => {
    if (!inventory || !newItem.recipe || newItem.recipe.length === 0) return true;
    
    const requirements: Record<string, number> = {};
    
    // Sum requirements of existing cart
    currentCart.forEach(cartItem => {
      cartItem.recipe?.forEach((r: any) => {
        requirements[r.ingredientId] = (requirements[r.ingredientId] || 0) + (r.quantity * (cartItem.quantity || 1));
      });
    });

    // Add requirements of new quantity
    newItem.recipe?.forEach((r: any) => {
      requirements[r.ingredientId] = (requirements[r.ingredientId] || 0) + (r.quantity * qtyToAdd);
    });

    return Object.entries(requirements).every(([ingId, qty]) => {
      const ing = inventory.find((i: any) => i.id === ingId);
      return !ing || ing.currentStock >= qty;
    });
  };

  const getSimpleRecommendations = (item: any) => {
    if (!menuItems) return;
    let targetCategories: string[] = [];
    let title = "¿No quieres agregar algo más?";

    if (item.category === "Comida") {
      targetCategories = ["Bebidas", "Golosinas"];
      title = "¿Te gustaría una bebida fresca o algo dulce para acompañar?";
    } else if (item.category === "Bebidas") {
      targetCategories = ["Comida", "Golosinas"];
      title = "¿Hambre? ¡Mira estas opciones deliciosas para tu bebida!";
    } else if (item.category === "Golosinas") {
      targetCategories = ["Bebidas", "Comida"];
      title = "¿Algo para acompañar tu antojo?";
    }

    const suggestions = menuItems.filter(m => 
      targetCategories.includes(m.category) && 
      m.id !== item.id &&
      !cart.some(cartItem => cartItem.id === m.id) &&
      checkStockAvailability(m, cart)
    ).sort(() => 0.5 - Math.random()).slice(0, 4);

    if (suggestions.length > 0) {
      setUpsellRecommendations(suggestions);
      setUpsellTitle(title);
      setShowUpsell(true);
    }
  };

  const updateCartQuantity = (item: any, delta: number, silent = false) => {
    const existing = cart.find(i => i.id === item.id);
    
    if (delta > 0 && !checkStockAvailability(item, cart, delta)) {
      toast({ variant: "destructive", title: "🚫 LIMITE DE INSUMOS", description: `No hay suficientes ingredientes para más ${item.name}.` });
      return;
    }

    if (existing) {
      const newQty = (existing.quantity || 1) + delta;
      if (newQty <= 0) {
        setCart(prev => prev.filter(i => i.id !== item.id));
      } else {
        setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
      }
    } else if (delta > 0) {
      setCart(prev => [...prev, { ...item, quantity: delta }]);
      if (!silent) {
        toast({ className: "uni-toast-info", title: "AÑADIDO", description: `${item.name} en el carrito.` });
        getSimpleRecommendations(item);
      }
    }
    
    if (silent) setShowUpsell(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handlePayment = async () => {
    if (!user || cart.length === 0 || !paymentMethod) return;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const orderId = `${Math.floor(100 + Math.random() * 899)}`;
    const now = new Date();

    const orderData = {
      id: orderId,
      userId: user.uid,
      user: user.displayName || 'Estudiante',
      totalAmount,
      status: 'Pending',
      method: paymentMethod,
      orderDate: now.toISOString(),
      isRated: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      items: cart.map(i => ({ name: i.name, qty: i.quantity || 1, price: i.price })),
      attendant: "Ventanilla UniEats"
    };

    const orderRef = doc(firestore, 'orders', orderId);
    await setDoc(orderRef, orderData);

    // DESCUENTO ROBUSTO DE INVENTARIO USANDO increment()
    cart.forEach(cartItem => {
      cartItem.recipe?.forEach((r: any) => {
        const ingRef = doc(firestore, 'ingredients', r.ingredientId);
        updateDocumentNonBlocking(ingRef, {
          currentStock: increment(-(r.quantity * (cartItem.quantity || 1))),
          updatedAt: serverTimestamp()
        });
      });
    });

    setLastOrder({ ...orderData, formattedDate: now.toLocaleString() });
    setCart([]);
    setShowPayment(false);
    setPaymentMethod(null);
    setShowTicket(true);
    toast({ className: "uni-toast-success", title: "PEDIDO REALIZADO", description: `Orden #${orderId} enviada a cocina.` });
  };

  const handleSaveRating = async () => {
    if (!orderToRate || serviceRating === 0) return;

    const batch = writeBatch(firestore);
    const now = new Date().toISOString();

    const serviceReviewId = `SRV-${Date.now()}`;
    const serviceReviewRef = doc(firestore, 'service_reviews', serviceReviewId);
    batch.set(serviceReviewRef, {
      id: serviceReviewId,
      orderId: orderToRate.id,
      userId: user?.uid,
      rating: serviceRating,
      createdAt: now
    });

    Object.entries(productRatings).forEach(([itemName, rating], idx) => {
      const prodReviewId = `PRD-${Date.now()}-${idx}`;
      const prodReviewRef = doc(firestore, 'product_reviews', prodReviewId);
      batch.set(prodReviewRef, {
        id: prodReviewId,
        orderId: orderToRate.id,
        userId: user?.uid,
        menuItemName: itemName,
        rating: rating,
        createdAt: now
      });
    });

    const orderRef = doc(firestore, 'orders', orderToRate.id);
    batch.update(orderRef, {
      isRated: true,
      rating: serviceRating,
      updatedAt: serverTimestamp()
    });

    await batch.commit();

    setShowRating(false);
    setServiceRating(0);
    setProductRatings({});
    setOrderToRate(null);
    toast({ className: "uni-toast-success", title: "¡GRACIAS!", description: "Tu opinión nos ayuda a mejorar." });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  if (isUserLoading || (user && (isInvLoading || isMenuLoading || isReviewsLoading))) {
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
             {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartItemCount}</span>}
           </Button>
           <Button variant="outline" className="rounded-xl h-10 font-black gap-2 border-2 text-xs" onClick={handleLogout}>SALIR</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {userOrders && userOrders.length > 0 && userOrders.some(o => o.status !== 'Picked Up' && o.status !== 'Cancelled') && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">Estatus de mi Pedido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userOrders.filter(o => o.status !== 'Picked Up' && o.status !== 'Cancelled').map(order => (
                <div key={order.id} className="bg-white border-2 border-secondary/20 rounded-3xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                      order.status === 'Pending' ? "bg-slate-400" : order.status === 'Preparing' ? "bg-secondary" : "bg-emerald-500"
                    )}>
                      {order.status === 'Pending' ? <Clock /> : order.status === 'Preparing' ? <Flame className="text-black" /> : <CheckCircle2 />}
                    </div>
                    <div>
                      <p className="font-black">Pedido #{order.id}</p>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        {order.status === 'Pending' ? 'Esperando pago/autorización' : order.status === 'Preparing' ? 'En preparación' : '¡Listo para recoger!'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-black px-3 h-7 rounded-lg">
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

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
          {menuItems?.filter(item => (selectedCategory === "Todas" || item.category === selectedCategory) && item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
            const avail = checkStockAvailability(item, cart);
            const rating = productAverages[item.name] || 0;
            const inCart = cart.find(i => i.id === item.id);
            
            return (
              <Card key={item.id} className={cn("group border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1", !avail && "opacity-50 grayscale")}>
                <div className="aspect-video relative overflow-hidden">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 25vw" />
                  <div className="absolute top-4 right-4 bg-secondary text-black h-10 px-4 rounded-full text-lg font-black flex items-center shadow-xl">$ {item.price.toFixed(2)}</div>
                  {rating > 0 && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-md border border-secondary/20">
                      <Star className="fill-secondary text-secondary" size={14} />
                      <span className="text-xs font-black">{rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-primary uppercase mb-1">{item.category}</p>
                    <Badge variant="outline" className="text-[8px] font-black uppercase gap-1"><Tag size={8}/> {item.unit}</Badge>
                  </div>
                  <CardTitle className="text-xl font-black line-clamp-1">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-0">
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={12} 
                        className={cn(
                          "transition-colors",
                          s <= Math.round(rating) ? "fill-secondary text-secondary" : "text-muted-foreground/20"
                        )} 
                      />
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-4 mt-auto">
                  {inCart ? (
                    <div className="flex items-center justify-between w-full bg-muted/30 rounded-2xl p-1 border-2 border-primary/10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl h-12 w-12 text-primary"
                        onClick={() => updateCartQuantity(item, -1)}
                      >
                        <Minus size={20} />
                      </Button>
                      <span className="font-black text-xl">{inCart.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl h-12 w-12 text-primary"
                        onClick={() => updateCartQuantity(item, 1)}
                      >
                        <Plus size={20} />
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-lg" onClick={() => updateCartQuantity(item, 1)} disabled={!avail}>
                      {avail ? 'Añadir al Carrito' : 'Agotado'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>

      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-w-sm">
          <DialogHeader className="sr-only">
            <DialogTitle>Ticket de Compra - UniEats</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-8 relative">
            <div className="text-center space-y-2 mb-6 border-b-2 border-dashed pb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg mb-2">
                <UtensilsCrossed size={32} />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">Cafetería UniEats</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Campus Sevilla Toledo 39</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase">Ticket No.</p>
                  <p className="text-2xl font-black text-primary">#{lastOrder?.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase">Fecha / Hora</p>
                  <p className="text-[11px] font-bold">{lastOrder?.formattedDate}</p>
                </div>
              </div>

              <div className="py-4 border-y-2 border-dashed space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Artículos</p>
                {lastOrder?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm font-bold">
                    <span>{item.name} x{item.qty}</span>
                    <span>$ {(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-black uppercase">Total</span>
                <span className="text-3xl font-black text-primary">$ {lastOrder?.totalAmount?.toFixed(2)}</span>
              </div>

              <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase text-center">Información de Servicio</p>
                <p className="text-xs font-bold text-center italic">Atendido por: {lastOrder?.attendant}</p>
                <p className="text-[10px] font-black text-center mt-2 uppercase tracking-widest text-secondary-foreground">¡Gracias por tu compra!</p>
              </div>
            </div>

            <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_8px,white_8px)] bg-[length:16px_16px] bg-repeat-x"></div>
          </div>
          <div className="p-6 bg-muted/10 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl font-black h-12 gap-2" onClick={() => window.print()}>
              <Printer size={16} /> IMPRIMIR
            </Button>
            <Button className="flex-1 rounded-xl font-black h-12 mcd-gradient" onClick={() => setShowTicket(false)}>
              ENTENDIDO
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRating} onOpenChange={(open) => {
        if (!open) {
          setShowRating(false);
          setOrderToRate(null);
        }
      }}>
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <DialogHeader className="bg-primary p-6 text-white text-center">
            <DialogTitle className="text-2xl font-black tracking-tighter">¡PEDIDO ENTREGADO!</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-8 space-y-8 bg-white">
              <div className="text-center space-y-4">
                <div className="bg-secondary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <UtensilsCrossed size={40} className="text-secondary" />
                </div>
                <p className="font-black text-xl leading-tight">¿Qué tal el servicio?</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setServiceRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={36} 
                        className={cn(
                          "transition-colors",
                          serviceRating >= star 
                            ? "fill-secondary text-secondary" 
                            : "text-muted border-none"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-muted w-full" />

              <div className="space-y-6">
                <p className="font-black text-lg text-center leading-tight">¿Te gustó lo que pediste?</p>
                {orderToRate?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-muted/10 p-4 rounded-3xl border-2 border-transparent">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm truncate pr-2">{item.name}</span>
                      <Badge variant="outline" className="text-[10px] font-black h-5">x{item.qty}</Badge>
                    </div>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setProductRatings(prev => ({ ...prev, [item.name]: star }))}
                          className="transition-transform active:scale-90"
                        >
                          <Star 
                            size={28} 
                            className={cn(
                              "transition-colors",
                              (productRatings[item.name] || 0) >= star 
                                ? "fill-primary text-primary" 
                                : "text-muted-foreground/20 border-none"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full h-16 rounded-2xl text-lg font-black mcd-gradient shadow-xl"
                onClick={handleSaveRating}
                disabled={serviceRating === 0}
              >
                ENVIAR VALORACIÓN
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {cartItemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-50 flex gap-3">
          <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full shadow-2xl border-4 border-white" onClick={() => setCart([])}><Trash2 size={24} /></Button>
          <Button className="flex-1 h-16 rounded-2xl shadow-2xl text-lg font-black flex justify-between px-8 mcd-gradient" onClick={() => setShowPayment(true)}>
            <span>{cartItemCount} productos</span>
            <span className="flex items-center gap-2">PEDIR $ {total.toFixed(2)} <ChevronRight size={24} /></span>
          </Button>
        </div>
      )}

      <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-w-2xl">
          <DialogHeader className="bg-secondary p-8 text-black">
            <DialogTitle className="text-3xl font-black flex items-center gap-3">
              <Sparkles className="text-primary" /> ¿Qué tal algo más?
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-white">
            <p className="font-black text-xl leading-tight text-center">{upsellTitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upsellRecommendations.map((rec: any) => (
                <div key={rec.id} className="flex gap-4 p-4 rounded-3xl border-2 hover:border-primary/20 transition-all bg-muted/10">
                  <div className="w-20 h-20 relative rounded-2xl overflow-hidden shrink-0 shadow-md">
                    <Image src={rec.imageUrl} alt={rec.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[9px] font-black text-primary uppercase">{rec.category}</p>
                      <p className="font-black text-base leading-tight">{rec.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-black text-lg">$ {rec.price.toFixed(2)}</p>
                      <Button size="sm" className="rounded-full font-black mcd-gradient px-4 h-8" onClick={() => updateCartQuantity(rec, 1, true)}>Añadir</Button>
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
                    <p className="text-[11px] font-medium text-emerald-800 leading-tight">Envía tu comprobante al WhatsApp: <span className="font-black">+52 55 8468 9834</span> con tu número de pedido.</p>
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
