'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat,
  Clock, 
  CheckCircle2, 
  Flame, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function KitchenPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const updateStatus = (id: string, newStatus: 'Preparing' | 'Ready for Pickup') => {
    const orderRef = doc(firestore, 'orders', id);
    updateDocumentNonBlocking(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    if (newStatus === 'Ready for Pickup') {
      toast({
        className: "uni-toast-success",
        title: `✅ PEDIDO #${id} LISTO`,
        description: "Notificado al cliente.",
      });
    }
  };

  const pendingOrders = orders?.filter(o => o.status === 'Pending') || [];
  const preparingOrders = orders?.filter(o => o.status === 'Preparing') || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <header className="bg-white border-b-4 px-10 h-24 flex items-center justify-between shadow-xl z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 mcd-gradient rounded-3xl flex items-center justify-center text-white shadow-lg">
            <ChefHat size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Cocina UniEats</h1>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Órdenes Entrantes en Tiempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-2xl h-14 px-8 gap-3 font-black text-lg border-2" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft size={24} /> PANEL ADMIN
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-hidden bg-muted/20">
        {/* Columna: Nuevos Pedidos */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm">
            <h2 className="text-3xl font-black flex items-center gap-4">
              <Clock className="text-primary animate-pulse" /> POR EMPEZAR 
            </h2>
            <Badge className="h-12 px-6 rounded-full bg-primary text-white text-2xl font-black">
              {pendingOrders.length}
            </Badge>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {pendingOrders.map(order => (
                <Card key={order.id} className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden border-l-[1rem] border-l-primary">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-4xl font-black text-primary">#{order.id}</p>
                        <p className="text-xl font-bold text-muted-foreground">{order.user}</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-8">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-muted/50 p-4 rounded-2xl border-2">
                          <span className="text-2xl font-black">{item.name}</span>
                          <span className="text-2xl font-black bg-primary text-white h-12 w-12 flex items-center justify-center rounded-full">
                            {item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full h-20 rounded-3xl text-2xl font-black mcd-gradient shadow-xl shadow-primary/20 gap-3"
                      onClick={() => updateStatus(order.id, 'Preparing')}
                    >
                      <Flame size={28} /> PREPARAR
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* Columna: En Preparación */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm">
            <h2 className="text-3xl font-black flex items-center gap-4">
              <Flame className="text-secondary" /> ¡ESTA DE FUEGO! 
            </h2>
            <Badge className="h-12 px-6 rounded-full bg-secondary text-black text-2xl font-black">
              {preparingOrders.length}
            </Badge>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {preparingOrders.map(order => (
                <Card key={order.id} className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden border-l-[1rem] border-l-secondary">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-4xl font-black text-secondary">#{order.id}</p>
                        <p className="text-xl font-bold text-muted-foreground">{order.user}</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-8">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-secondary/5 p-4 rounded-2xl border-2 border-secondary/20">
                          <span className="text-2xl font-black">{item.name}</span>
                          <span className="text-2xl font-black bg-secondary text-black h-12 w-12 flex items-center justify-center rounded-full">
                            {item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full h-20 rounded-3xl text-2xl font-black bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 gap-3 text-white border-none"
                      onClick={() => updateStatus(order.id, 'Ready for Pickup')}
                    >
                      <CheckCircle2 size={28} /> LISTO
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </section>
      </main>
    </div>
  );
}
