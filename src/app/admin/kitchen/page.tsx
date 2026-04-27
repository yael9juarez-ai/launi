
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  Flame, 
  LogOut, 
  ChefHat,
  Bell,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Order {
  id: string;
  items: { name: string, qty: number }[];
  status: 'pending' | 'preparing' | 'ready';
  time: string;
  user: string;
}

const INITIAL_ORDERS: Order[] = [
  { id: "#102", items: [{ name: "Tacos de Guisado", qty: 3 }, { name: "Coca Cola", qty: 1 }], status: 'pending', time: '2m', user: 'Juan R.' },
  { id: "#104", items: [{ name: "Hamburguesa Clásica", qty: 1 }, { name: "Papas", qty: 1 }], status: 'preparing', time: '5m', user: 'Maria L.' },
  { id: "#105", items: [{ name: "Sincronizadas", qty: 2 }], status: 'preparing', time: '8m', user: 'Pedro S.' },
];

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const router = useRouter();
  const { toast } = useToast();

  const updateStatus = (id: string, newStatus: 'preparing' | 'ready') => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    
    if (newStatus === 'ready') {
      toast({
        className: "uni-toast-success",
        title: `✅ Pedido ${id} completado`,
        description: "El cliente ha sido notificado y aparece en pantalla de turnos.",
      });
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <header className="bg-white border-b-2 p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 uni-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Panel de Cocina</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">UniEats • Gestión de Pedidos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-xl gap-2 font-bold" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft size={18} /> Panel Admin
          </Button>
          <Button variant="ghost" className="rounded-xl text-destructive hover:bg-destructive/10 font-bold" onClick={() => router.push('/login')}>
            <LogOut size={18} /> Salir
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Columna: Pendientes */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Bell className="text-primary animate-bounce" /> NUEVAS ÓRDENES 
              <Badge className="ml-2 bg-primary text-white rounded-full">{pendingOrders.length}</Badge>
            </h2>
          </div>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <div className="h-40 border-2 border-dashed rounded-3xl flex items-center justify-center text-muted-foreground font-medium">
                  Sin pedidos nuevos...
                </div>
              ) : (
                pendingOrders.map(order => (
                  <Card key={order.id} className="border-none shadow-md rounded-[2rem] bg-white hover:shadow-xl transition-all border-l-8 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                      <div>
                        <CardTitle className="text-2xl font-black">{order.id}</CardTitle>
                        <CardDescription className="font-bold text-primary">{order.user}</CardDescription>
                      </div>
                      <Badge variant="outline" className="rounded-full font-black px-4">{order.time}</Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2 mb-6">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border">
                            <span className="font-bold text-lg">{item.name}</span>
                            <Badge className="h-8 w-8 rounded-full flex items-center justify-center font-black">x{item.qty}</Badge>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full h-14 rounded-2xl text-lg font-black gap-2 shadow-lg shadow-primary/20"
                        onClick={() => updateStatus(order.id, 'preparing')}
                      >
                        <Flame size={20} /> Empezar a Cocinar
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </section>

        {/* Columna: Preparando */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Flame className="text-orange-500" /> EN PREPARACIÓN 
              <Badge className="ml-2 bg-orange-500 text-white rounded-full">{preparingOrders.length}</Badge>
            </h2>
          </div>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {preparingOrders.length === 0 ? (
                <div className="h-40 border-2 border-dashed rounded-3xl flex items-center justify-center text-muted-foreground font-medium">
                  Nada en los fogones...
                </div>
              ) : (
                preparingOrders.map(order => (
                  <Card key={order.id} className="border-none shadow-md rounded-[2rem] bg-white hover:shadow-xl transition-all border-l-8 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                      <div>
                        <CardTitle className="text-2xl font-black">{order.id}</CardTitle>
                        <CardDescription className="font-bold text-orange-600">{order.user}</CardDescription>
                      </div>
                      <Badge variant="outline" className="rounded-full font-black px-4 bg-orange-50">{order.time}</Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2 mb-6">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                            <span className="font-bold text-lg">{item.name}</span>
                            <Badge className="h-8 w-8 rounded-full flex items-center justify-center font-black bg-orange-500">x{item.qty}</Badge>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full h-14 rounded-2xl text-lg font-black gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => updateStatus(order.id, 'ready')}
                      >
                        <CheckCircle2 size={20} /> Marcar como Listo
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </section>
      </main>
    </div>
  );
}
