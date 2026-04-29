'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UtensilsCrossed, 
  DollarSign, 
  Package, 
  BarChart3, 
  Clock, 
  LogOut,
  FileText,
  TrendingUp,
  Receipt,
  ChefHat,
  Tv,
  CheckCircle2,
  CreditCard,
  Banknote,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { signOut } from 'firebase/auth';

const chartData = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3200 },
  { name: 'Mie', sales: 6500 },
  { name: 'Jue', sales: 8900 },
  { name: 'Vie', sales: 5400 },
  { name: 'Sab', sales: 2100 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && (!user || user.displayName !== 'admin')) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'orders');
  }, [firestore, user]);

  const { data: allOrders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  const pendingOrders = allOrders?.filter(o => o.status === 'Pending') || [];
  const confirmedOrders = allOrders?.filter(o => o.status !== 'Pending' && o.status !== 'Cancelled') || [];

  const confirmedSalesTotal = useMemo(() => {
    return confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [confirmedOrders]);

  const confirmedItemsStats = useMemo(() => {
    const stats: Record<string, any> = {};
    confirmedOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const key = item.name || 'Desconocido';
        if (!stats[key]) {
          stats[key] = { name: key, qty: 0, total: 0 };
        }
        stats[key].qty += item.qty || 1;
        stats[key].total += (item.price || 0) * (item.qty || 1);
      });
    });
    return stats;
  }, [confirmedOrders]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleLiberatePayment = (orderId: string) => {
    const orderRef = doc(firestore, 'orders', orderId);
    updateDocumentNonBlocking(orderRef, {
      status: 'Preparing',
      updatedAt: serverTimestamp()
    });

    toast({
      className: "uni-toast-success",
      title: "✅ PAGO LIBERADO",
      description: `Pedido #${orderId} enviado a preparación.`,
    });
  };

  const calculateReportData = (periodFactor: number) => {
    const totalSales = confirmedSalesTotal * periodFactor;
    const items = Object.values(confirmedItemsStats).map(item => ({
      ...item,
      qty: Math.ceil(item.qty * periodFactor),
      total: item.total * periodFactor
    }));

    return {
      totalSales,
      totalTransactions: Math.ceil(confirmedOrders.length * periodFactor),
      items: items.sort((a, b) => b.total - a.total)
    };
  };

  const reportData = useMemo(() => ({
    daily: calculateReportData(1),
    weekly: calculateReportData(5),
    monthly: calculateReportData(20),
  }), [confirmedSalesTotal, confirmedItemsStats, confirmedOrders]);

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.displayName !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#FDFDFD]">
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-9 h-9 mcd-gradient rounded-xl flex items-center justify-center text-white shadow-md">
            <UtensilsCrossed size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter">UniEats <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full align-middle ml-1">ADMIN</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-primary bg-primary/5 font-bold rounded-xl">
            <BarChart3 size={20} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/kitchen')}>
            <ChefHat size={20} /> Cocinero
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/pos')}>
            <DollarSign size={20} /> Punto de Venta
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/inventory')}>
            <Package size={20} /> Inventario
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={20} /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Panel Administrativo</h1>
            <p className="text-muted-foreground font-medium">Verificación de ingresos y gestión global.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-2 gap-2" onClick={() => window.open('/queue', '_blank')}>
              <Tv size={20} /> Monitor Público
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
                  <FileText size={20} /> Reportes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="bg-primary p-8 text-white">
                  <DialogTitle className="text-3xl font-black flex items-center gap-3">
                    <TrendingUp size={32} /> DESGLOSE FINANCIERO
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="daily" className="p-8">
                  <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 rounded-2xl p-1 mb-8">
                    <TabsTrigger value="daily" className="rounded-xl font-black">DIARIO</TabsTrigger>
                    <TabsTrigger value="weekly" className="rounded-xl font-black">SEMANAL</TabsTrigger>
                    <TabsTrigger value="monthly" className="rounded-xl font-black">MENSUAL</TabsTrigger>
                  </TabsList>
                  {['daily', 'weekly', 'monthly'].map((period) => (
                    <TabsContent key={period} value={period} className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                          <p className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">Ventas Totales</p>
                          <p className="text-3xl font-black text-primary">$ {reportData[period as keyof typeof reportData].totalSales.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                          <p className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">Transacciones</p>
                          <p className="text-3xl font-black">{reportData[period as keyof typeof reportData].totalTransactions}</p>
                        </div>
                      </div>
                      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                        <Receipt className="text-primary" /> DESGLOSE POR PRODUCTO
                      </h3>
                      <ScrollArea className="h-[300px] border-2 rounded-2xl">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b-2">
                              <TableHead className="font-black">Producto</TableHead>
                              <TableHead className="font-black text-center">Cant.</TableHead>
                              <TableHead className="font-black text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData[period as keyof typeof reportData].items.map((item: any, idx: number) => (
                              <TableRow key={idx} className="hover:bg-muted/20">
                                <TableCell className="font-bold">{item.name}</TableCell>
                                <TableCell className="text-center font-black text-primary">{item.qty}</TableCell>
                                <TableCell className="text-right font-black">$ {item.total.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white mb-8 border-l-[1rem] border-l-secondary">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Clock className="text-secondary" /> PAGOS POR LIBERAR (CLOUD)
            </CardTitle>
            <CardDescription className="font-bold">Valida el pago para permitir que el Cocinero empiece la preparación.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {pendingOrders.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <CheckCircle2 size={48} className="mx-auto mb-2" />
                <p className="font-black">Sin pagos pendientes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="bg-muted/30 p-6 rounded-[2rem] border-2 border-secondary/20 flex flex-col justify-between hover:border-secondary transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl font-black text-secondary">#{order.id}</span>
                        <Badge variant="outline" className="rounded-full font-black gap-2">
                          {order.method === 'transfer' ? <CreditCard size={12} /> : <Banknote size={12} />}
                          {order.method === 'transfer' ? 'TRANS' : 'CASH'}
                        </Badge>
                      </div>
                      <p className="font-black text-lg">{order.user}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {order.items?.map((it: any) => it.name).join(', ')}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                      <p className="text-2xl font-black text-primary">$ {order.totalAmount?.toFixed(2)}</p>
                      <Button 
                        size="sm" 
                        className="rounded-xl font-black bg-secondary text-black hover:bg-secondary/80"
                        onClick={() => handleLiberatePayment(order.id)}
                      >
                        LIBERAR
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-2">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-2xl font-black">Histórico de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E30613" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E30613" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#E30613" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}