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
  ArrowRight
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
    if (!isUserLoading && (!user || user.displayName !== 'cocinero')) {
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

  const updateOrderStatus = (id: string, newStatus: string) => {
    const orderRef = doc(firestore, 'orders', id);
    updateDocumentNonBlocking(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    const messages = {
      'Preparing': "👨‍🍳 COMENZANDO PREPARACIÓN",
      'Ready for Pickup': "✅ ¡ORDEN LISTA PARA ENTREGA!",
    };

    toast({
      className: newStatus === 'Ready for Pickup' ? "uni-toast-success" : "uni-toast-info",
      title: messages[newStatus as keyof typeof messages] || "ACTUALIZADO",
      description: `Pedido #${id} actualizado en la nube.`,
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

  if (!user || user.displayName !== 'cocinero') {
    return null;
  }

  const incomingOrders = orders?.filter(o => o.status === 'Pending' || o.status === 'Confirmed').sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds) || [];
  const preparingOrders = orders?.filter(o => o.status === 'Preparing').sort((a, b) => a.updatedAt?.seconds - b.updatedAt?.seconds) || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <header className="bg-white border-b-4 px-6 md:px-10 h-24 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 mcd-gradient rounded-3xl flex items-center justify-center text-white shadow-lg">
            <ChefHat className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">OPERACIONES COCINA</h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Panel de Control de Producción</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-10 px-4 rounded-xl font-black border-2 hidden md:flex">PERSONAL: {user.displayName?.toUpperCase()}</Badge>
          <Button variant="outline" className="rounded-xl font-black border-2 h-12 gap-2 text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={18} /> SALIR
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 bg-muted/20">
        <Tabs defaultValue="orders" className="h-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xl mx-auto h-16 bg-white rounded-2xl p-1 shadow-lg mb-8 border-2">
            <TabsTrigger value="orders" className="rounded-xl font-black text-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              GESTIÓN DE PEDIDOS
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl font-black text-xl data-[state=active]:bg-secondary data-[state=active]:text-black transition-all">
              ALMACÉN DE INSUMOS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="m-0 h-full">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Clock size={32} className="animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter uppercase">Nuevos Pedidos</h2>
                      <p className="text-xs font-bold text-muted-foreground">Esperando confirmación</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white font-black text-4xl px-6 py-2 rounded-2xl shadow-lg">{incomingOrders.length}</Badge>
                </div>

                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-6 pr-4">
                    {incomingOrders.length === 0 ? (
                      <div className="bg-white/50 p-16 rounded-[3rem] text-center border-4 border-dashed">
                        <UtensilsCrossed size={64} className="mx-auto mb-4 opacity-10" />
                        <p className="font-black text-muted-foreground opacity-30 italic text-2xl">COCINA LIMPIA</p>
                      </div>
                    ) : (
                      incomingOrders.map(order => (
                        <Card key={order.id} className="border-none shadow-xl rounded-[3rem] bg-white border-l-[1.5rem] border-l-primary overflow-hidden">
                          <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-5xl font-black text-primary leading-none">#{order.id}</span>
                                <p className="font-black text-muted-foreground uppercase text-sm mt-2">USUARIO: {order.user}</p>
                              </div>
                              <Badge variant="secondary" className="font-black h-10 px-4 rounded-full text-lg uppercase">
                                {order.method === 'transfer' ? 'PAGADO QR' : 'EFECTIVO'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-8 pt-0">
                            <div className="space-y-3 mb-8">
                              {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-muted/30 p-5 rounded-2xl border-2">
                                  <span className="font-black text-2xl">{item.name}</span>
                                  <span className="bg-primary text-white w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl shadow-md">
                                    {item.qty}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <Button 
                              className="w-full h-20 rounded-[2rem] text-2xl font-black mcd-gradient shadow-xl hover:scale-[1.02] transition-transform gap-4"
                              onClick={() => updateOrderStatus(order.id, 'Preparing')}
                            >
                              <Flame className="w-8 h-8" /> EMPEZAR A COCINAR <ArrowRight />
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-secondary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                      <Flame size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter uppercase">En Preparación</h2>
                      <p className="text-xs font-bold text-muted-foreground">Cocinando ahora</p>
                    </div>
                  </div>
                  <Badge className="bg-secondary text-black font-black text-4xl px-6 py-2 rounded-2xl shadow-lg">{preparingOrders.length}</Badge>
                </div>

                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-6 pr-4">
                    {preparingOrders.length === 0 ? (
                      <div className="bg-white/50 p-16 rounded-[3rem] text-center border-4 border-dashed">
                        <Flame size={64} className="mx-auto mb-4 opacity-10" />
                        <p className="font-black text-muted-foreground opacity-30 italic text-2xl">DISPONIBLE</p>
                      </div>
                    ) : (
                      preparingOrders.map(order => (
                        <Card key={order.id} className="border-none shadow-xl rounded-[3rem] bg-white border-l-[1.5rem] border-l-secondary overflow-hidden">
                          <CardHeader className="p-8 pb-4">
                            <span className="text-5xl font-black text-secondary">#{order.id}</span>
                            <p className="font-black text-muted-foreground uppercase text-sm mt-2">USUARIO: {order.user}</p>
                          </CardHeader>
                          <CardContent className="p-8 pt-0">
                            <div className="space-y-3 mb-8">
                              {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-secondary/5 p-5 rounded-2xl border-2 border-secondary/20">
                                  <span className="font-black text-2xl">{item.name}</span>
                                  <span className="bg-secondary text-black w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl">
                                    {item.qty}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <Button 
                              className="w-full h-20 rounded-[2rem] text-2xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl hover:scale-[1.02] transition-transform gap-4"
                              onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                            >
                              <CheckCircle2 className="w-8 h-8" /> MARCAR LISTO / AUTORIZAR
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="m-0 h-full">
            <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden border-t-8 border-t-secondary">
              <CardHeader className="p-12 border-b-2 flex flex-row items-center justify-between bg-muted/5">
                <div>
                  <CardTitle className="text-4xl font-black flex items-center gap-6">
                    <Box className="text-secondary w-12 h-12" /> STOCK DE COCINA
                  </CardTitle>
                  <p className="text-muted-foreground font-black uppercase text-xs tracking-[0.3em] mt-2">Inventario en Tiempo Real</p>
                </div>
                <Badge variant="outline" className="h-12 px-6 rounded-2xl font-black border-2 bg-white">ALMACÉN ACTIVO</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-12">
                    {inventory?.map((item: any) => {
                      const isLow = item.currentStock <= item.minStockLevel;
                      return (
                        <div key={item.id} className={cn(
                          "p-8 rounded-[2.5rem] border-4 transition-all flex flex-col justify-between shadow-sm",
                          isLow ? "bg-primary/5 border-primary/20" : "bg-white border-muted/50"
                        )}>
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-2xl font-black leading-tight mb-2">{item.name}</h3>
                              <Badge className={cn("rounded-full font-black text-[10px] uppercase px-3", isLow ? "bg-primary text-white" : "bg-secondary text-black")}>
                                {isLow ? "BAJO STOCK" : "ÓPTIMO"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <span className={cn("text-5xl font-black block leading-none", isLow ? "text-primary" : "text-foreground")}>
                                {item.currentStock}
                              </span>
                              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{item.unitOfMeasure}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-14 w-14 rounded-2xl border-4 hover:bg-destructive/10"
                                onClick={() => updateStock(item.id, item.currentStock - 1)}
                              >
                                <Minus className="w-6 h-6" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-14 w-14 rounded-2xl border-4 hover:bg-primary/10"
                                onClick={() => updateStock(item.id, item.currentStock + 1)}
                              >
                                <Plus className="w-6 h-6" />
                              </Button>
                              <div className="flex-1 bg-muted/30 rounded-2xl flex items-center justify-center font-black uppercase text-[10px] text-muted-foreground border-2">
                                Ajuste Rápido
                              </div>
                            </div>
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
