'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat,
  Clock, 
  CheckCircle2, 
  Flame, 
  Loader2,
  Box,
  Plus,
  Minus,
  LogOut,
  UtensilsCrossed,
  ArrowRight,
  Send,
  BellRing,
  LayoutDashboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';

export default function KitchenPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && (!user || (user.displayName !== 'cocinero' && user.displayName !== 'admin'))) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'orders');
  }, [firestore, user]);

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'ingredients');
  }, [firestore, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);
  const { data: inventory, isLoading: isInvLoading } = useCollection(ingredientsQuery);

  const updateOrderStatus = (id: string, newStatus: string, currentStatus?: string) => {
    const orderRef = doc(firestore, 'orders', id);
    updateDocumentNonBlocking(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    let title = "ACTUALIZADO";
    let description = `Pedido #${id} actualizado en la nube.`;

    if (newStatus === 'Preparing') {
      title = "👨‍🍳 PREPARACIÓN INICIADA";
      if (currentStatus === 'Pending') {
        description = `Pedido #${id} iniciado. Pago liberado automáticamente.`;
      }
    } else if (newStatus === 'Ready for Pickup') {
      title = "✅ PEDIDO LISTO EN BARRA";
      description = `El alumno ya puede ver que su pedido #${id} está listo.`;
    } else if (newStatus === 'Picked Up') {
      title = "📦 PEDIDO ENTREGADO";
      description = `Pedido #${id} finalizado con éxito.`;
    }

    toast({
      className: newStatus === 'Ready for Pickup' ? "uni-toast-success" : "uni-toast-info",
      title,
      description,
    });
  };

  const updateStock = (id: string, newAmount: number) => {
    const ingRef = doc(firestore, 'ingredients', id);
    updateDocumentNonBlocking(ingRef, {
      currentStock: Math.max(0, newAmount),
      updatedAt: serverTimestamp()
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || (user && (isOrdersLoading || isInvLoading))) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (user.displayName !== 'cocinero' && user.displayName !== 'admin')) {
    return null;
  }

  const isAdmin = user.displayName === 'admin';

  const incomingOrders = orders?.filter(o => o.status === 'Pending' || o.status === 'Confirmed').sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)) || [];
  const preparingOrders = orders?.filter(o => o.status === 'Preparing').sort((a, b) => (a.updatedAt?.seconds || 0) - (b.updatedAt?.seconds || 0)) || [];
  const readyOrders = orders?.filter(o => o.status === 'Ready for Pickup').sort((a, b) => (a.updatedAt?.seconds || 0) - (b.updatedAt?.seconds || 0)) || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <header className="bg-white border-b-4 px-6 md:px-10 h-20 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 mcd-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Panel del Cocinero</h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gestión de Producción y Pagos Automáticos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="rounded-xl font-black border-2 h-10 gap-2 text-primary hover:bg-primary/5 hidden md:flex"
              onClick={() => router.push('/admin/dashboard')}
            >
              <LayoutDashboard size={16} /> VOLVER AL PANEL
            </Button>
          )}
          <Badge variant="outline" className="h-9 px-4 rounded-xl font-black border-2 hidden md:flex uppercase">
            {isAdmin ? 'VISTA ADMIN' : `OPERADOR: ${user.displayName}`}
          </Badge>
          <Button variant="outline" className="rounded-xl font-black border-2 h-10 gap-2 text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={16} /> SALIR
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 bg-muted/10">
        <Tabs defaultValue="orders" className="h-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-14 bg-white rounded-2xl p-1 shadow-md mb-6 border-2">
            <TabsTrigger value="orders" className="rounded-xl font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              GESTIÓN DE PEDIDOS
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl font-black text-sm data-[state=active]:bg-secondary data-[state=active]:text-black transition-all">
              STOCK DE INSUMOS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="m-0 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border-2 border-primary/10">
                  <div className="flex items-center gap-3">
                    <Clock size={24} className="text-primary animate-pulse" />
                    <h2 className="text-xl font-black uppercase tracking-tighter">Entrantes</h2>
                  </div>
                  <Badge className="bg-primary text-white font-black text-xl px-4 py-1 rounded-xl">{incomingOrders.length}</Badge>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-4 pr-3">
                    {incomingOrders.map(order => (
                      <Card key={order.id} className="border-none shadow-md rounded-[2rem] bg-white border-l-8 border-l-primary overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-3xl font-black text-primary">#{order.id}</span>
                            <Badge variant="secondary" className="font-bold text-[10px] uppercase">
                              {order.status === 'Pending' ? 'POR LIBERAR' : 'PAGADO'}
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-6">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-bold">{item.name}</span>
                                <span className="font-black bg-muted px-2 py-1 rounded-lg">x{item.qty}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full h-14 rounded-2xl font-black mcd-gradient shadow-lg gap-2 text-sm"
                            onClick={() => updateOrderStatus(order.id, 'Preparing', order.status)}
                          >
                            <Flame size={18} /> EMPEZAR COCINA
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border-2 border-secondary/20">
                  <div className="flex items-center gap-3">
                    <Flame size={24} className="text-secondary" />
                    <h2 className="text-xl font-black uppercase tracking-tighter">Cocinando</h2>
                  </div>
                  <Badge className="bg-secondary text-black font-black text-xl px-4 py-1 rounded-xl">{preparingOrders.length}</Badge>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-4 pr-3">
                    {preparingOrders.map(order => (
                      <Card key={order.id} className="border-none shadow-md rounded-[2rem] bg-white border-l-8 border-l-secondary overflow-hidden">
                        <CardContent className="p-6">
                          <span className="text-3xl font-black text-secondary">#{order.id}</span>
                          <div className="space-y-2 my-4">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-bold">{item.name}</span>
                                <span className="font-black bg-secondary/10 px-2 py-1 rounded-lg">x{item.qty}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full h-14 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg gap-2 text-sm"
                            onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                          >
                            <CheckCircle2 size={18} /> MARCAR LISTO
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border-2 border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <BellRing size={24} className="text-emerald-500" />
                    <h2 className="text-xl font-black uppercase tracking-tighter">¡Listos!</h2>
                  </div>
                  <Badge className="bg-emerald-500 text-white font-black text-xl px-4 py-1 rounded-xl">{readyOrders.length}</Badge>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-4 pr-3">
                    {readyOrders.map(order => (
                      <Card key={order.id} className="border-none shadow-md rounded-[2rem] bg-white border-l-8 border-l-emerald-500 overflow-hidden">
                        <CardContent className="p-6">
                          <span className="text-3xl font-black text-emerald-500">#{order.id}</span>
                          <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">CLIENTE: {order.user}</p>
                          <div className="space-y-2 my-4">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-sm opacity-60">
                                <span className="font-bold">{item.name}</span>
                                <span className="font-black">x{item.qty}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full h-14 rounded-2xl font-black bg-slate-800 hover:bg-slate-900 text-white shadow-lg gap-2 text-sm"
                            onClick={() => updateOrderStatus(order.id, 'Picked Up')}
                          >
                            <Send size={18} /> ENTREGAR PEDIDO
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="m-0 h-full">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="p-8 border-b-2 bg-muted/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Box className="text-secondary" /> STOCK DE COCINA
                  </CardTitle>
                  <p className="text-muted-foreground font-bold text-xs">Inventario disponible para preparación</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                    {inventory?.map((item: any) => {
                      const isLow = item.currentStock <= item.minStockLevel;
                      return (
                        <div key={item.id} className={cn(
                          "p-6 rounded-3xl border-2 transition-all flex flex-col justify-between",
                          isLow ? "bg-primary/5 border-primary/20" : "bg-white border-muted"
                        )}>
                          <div>
                            <h3 className="text-lg font-black leading-tight mb-1">{item.name}</h3>
                            <div className="flex items-center gap-2 mb-4">
                              <span className={cn("text-3xl font-black", isLow ? "text-primary" : "text-foreground")}>
                                {item.currentStock}
                              </span>
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">{item.unitOfMeasure}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" size="icon" className="h-10 w-10 rounded-xl"
                              onClick={() => updateStock(item.id, item.currentStock - (item.unitOfMeasure === 'ml' || item.unitOfMeasure === 'gr' ? 100 : 1))}
                            >
                              <Minus size={16} />
                            </Button>
                            <Button 
                              variant="outline" size="icon" className="h-10 w-10 rounded-xl"
                              onClick={() => updateStock(item.id, item.currentStock + (item.unitOfMeasure === 'ml' || item.unitOfMeasure === 'gr' ? 100 : 1))}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}