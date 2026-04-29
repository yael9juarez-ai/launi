
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChefHat,
  Clock, 
  CheckCircle2, 
  Flame, 
  ArrowLeft,
  Loader2,
  Box,
  AlertTriangle,
  Plus,
  Minus,
  LayoutDashboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

export default function KitchenPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

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
    
    toast({
      className: newStatus === 'Ready for Pickup' ? "uni-toast-success" : "uni-toast-info",
      title: newStatus === 'Ready for Pickup' ? "✅ ¡ORDEN LISTA!" : "👨‍🍳 PREPARANDO",
      description: `Pedido #${id} actualizado.`,
    });
  };

  const updateStock = (id: string, amount: number) => {
    const ingRef = doc(firestore, 'ingredients', id);
    updateDocumentNonBlocking(ingRef, {
      currentStock: amount,
      updatedAt: serverTimestamp()
    });
  };

  if (isUserLoading || (user && (isOrdersLoading || isInvLoading))) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Redirigir si no es cocinero para evitar que alumnos vean esto
  if (!user || user.displayName !== 'cocinero') {
    router.push('/login');
    return null;
  }

  const pendingOrders = orders?.filter(o => o.status === 'Pending') || [];
  const preparingOrders = orders?.filter(o => o.status === 'Preparing') || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <header className="bg-white border-b-4 px-6 md:px-10 h-20 md:h-24 flex items-center justify-between shadow-xl z-10">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 mcd-gradient rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-lg">
            <ChefHat className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter">Cocina UniEats</h1>
            <p className="hidden md:block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Panel de Control de Producción</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-black border-2 h-12 px-4 md:px-6" onClick={() => router.push('/login')}>
             CERRAR SESIÓN
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 bg-muted/20">
        <Tabs defaultValue="orders" className="h-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-14 bg-white rounded-2xl p-1 shadow-md mb-8">
            <TabsTrigger value="orders" className="rounded-xl font-black text-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              ÓRDENES ({pendingOrders.length + preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl font-black text-lg data-[state=active]:bg-secondary data-[state=active]:text-black">
              ALMACÉN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="m-0 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border-2 border-primary/10">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Clock className="text-primary animate-pulse" /> ENTRANTE
                  </h2>
                  <Badge className="bg-primary text-white font-black text-xl px-4 py-1 rounded-full">{pendingOrders.length}</Badge>
                </div>
                
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-6 pr-2">
                    {pendingOrders.map(order => (
                      <Card key={order.id} className="border-none shadow-lg rounded-[2.5rem] bg-white border-l-[1rem] border-l-primary overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                          <span className="text-4xl font-black text-primary">#{order.id}</span>
                          <p className="font-bold text-muted-foreground uppercase text-xs">{order.user}</p>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                          <div className="space-y-2 mb-6">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center bg-muted/30 p-4 rounded-xl">
                                <span className="font-black text-xl">{item.name}</span>
                                <span className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-full font-black text-lg">
                                  {item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full h-16 rounded-2xl text-xl font-black mcd-gradient shadow-xl"
                            onClick={() => updateOrderStatus(order.id, 'Preparing')}
                          >
                            <Flame className="mr-2" /> COMENZAR
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border-2 border-secondary/20">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Flame className="text-secondary" /> EN FUEGO
                  </h2>
                  <Badge className="bg-secondary text-black font-black text-xl px-4 py-1 rounded-full">{preparingOrders.length}</Badge>
                </div>

                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-6 pr-2">
                    {preparingOrders.map(order => (
                      <Card key={order.id} className="border-none shadow-lg rounded-[2.5rem] bg-white border-l-[1rem] border-l-secondary overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                          <span className="text-4xl font-black text-secondary">#{order.id}</span>
                          <p className="font-bold text-muted-foreground uppercase text-xs">{order.user}</p>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                          <div className="space-y-2 mb-6">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center bg-secondary/5 p-4 rounded-xl border-2 border-secondary/10">
                                <span className="font-black text-xl">{item.name}</span>
                                <span className="bg-secondary text-black w-10 h-10 flex items-center justify-center rounded-full font-black text-lg">
                                  {item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full h-16 rounded-2xl text-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl"
                            onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                          >
                            <CheckCircle2 className="mr-2" /> MARCAR LISTO
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
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b">
                <CardTitle className="text-3xl font-black flex items-center gap-4">
                  <Box className="text-secondary w-10 h-10" /> CONTROL DE INSUMOS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-10">
                    {inventory?.map((item: any) => {
                      const isLow = item.currentStock <= item.minStockLevel;
                      return (
                        <div key={item.id} className={cn(
                          "p-6 rounded-[2rem] border-4 transition-all flex flex-col justify-between",
                          isLow ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-transparent"
                        )}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-black leading-tight">{item.name}</h3>
                              <Badge className={cn("mt-1 rounded-full font-black text-[10px]", isLow ? "bg-primary" : "bg-secondary text-black")}>
                                {isLow ? "CRÍTICO" : "NORMAL"}
                              </Badge>
                            </div>
                            <span className={cn("text-2xl font-black", isLow ? "text-primary" : "text-muted-foreground")}>
                              {item.currentStock} <span className="text-xs uppercase">{item.unitOfMeasure}</span>
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => updateStock(item.id, Math.max(0, item.currentStock - 1))}><Minus /></Button>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => updateStock(item.id, item.currentStock + 1)}><Plus /></Button>
                            <div className="flex-1 bg-white border-2 rounded-xl flex items-center justify-center font-black uppercase text-[10px]">Ajustar Stock</div>
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
