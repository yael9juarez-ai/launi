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
  Loader2,
  AlertCircle,
  Star,
  ExternalLink,
  MonitorPlay,
  ClipboardList,
  Heart
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
import { cn } from '@/lib/utils';

const dailyChartData = [
  { name: '08:00', sales: 1200 },
  { name: '10:00', sales: 4500 },
  { name: '12:00', sales: 8900 },
  { name: '14:00', sales: 6200 },
  { name: '16:00', sales: 2100 },
  { name: '18:00', sales: 900 },
];

const weeklyChartData = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3200 },
  { name: 'Mie', sales: 6500 },
  { name: 'Jue', sales: 8900 },
  { name: 'Vie', sales: 5400 },
  { name: 'Sab', sales: 2100 },
];

const monthlyChartData = [
  { name: 'Sem 1', sales: 25000 },
  { name: 'Sem 2', sales: 32000 },
  { name: 'Sem 3', sales: 28000 },
  { name: 'Sem 4', sales: 41000 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [chartPeriod, setChartPeriod] = useState("weekly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && (!user || user.displayName !== 'admin')) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'orders');
  }, [firestore, user]);

  const productReviewsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'product_reviews');
  }, [firestore, user]);

  const { data: allOrders, isLoading: isOrdersLoading } = useCollection(ordersQuery);
  const { data: allProdReviews, isLoading: isReviewsLoading } = useCollection(productReviewsQuery);

  const pendingOrders = allOrders?.filter(o => o.status === 'Pending') || [];
  const confirmedOrders = allOrders?.filter(o => o.status !== 'Pending' && o.status !== 'Cancelled') || [];

  const confirmedSalesTotal = useMemo(() => {
    return confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [confirmedOrders]);

  const avgRating = useMemo(() => {
    const rated = confirmedOrders.filter(o => o.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, o) => sum + o.rating, 0) / rated.length;
  }, [confirmedOrders]);

  const confirmedItemsStats = useMemo(() => {
    const stats: Record<string, any> = {};
    
    confirmedOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const key = item.name || 'Desconocido';
        if (!stats[key]) {
          stats[key] = { name: key, qty: 0, total: 0, ratingsCount: 0, ratingsSum: 0 };
        }
        stats[key].qty += item.qty || 1;
        stats[key].total += (item.price || 0) * (item.qty || 1);
      });
    });

    allProdReviews?.forEach(rev => {
      const key = rev.menuItemName;
      if (stats[key]) {
        stats[key].ratingsCount += 1;
        stats[key].ratingsSum += rev.rating;
      }
    });

    Object.keys(stats).forEach(key => {
      stats[key].avgRating = stats[key].ratingsCount > 0 
        ? stats[key].ratingsSum / stats[key].ratingsCount 
        : 0;
    });

    return stats;
  }, [confirmedOrders, allProdReviews]);

  const starProduct = useMemo(() => {
    const items = Object.values(confirmedItemsStats);
    if (items.length === 0) return null;
    
    return items.reduce((best: any, current: any) => {
      const currentScore = current.qty * (current.avgRating || 3);
      const bestScore = best ? best.qty * (best.avgRating || 3) : -1;
      return currentScore > bestScore ? current : best;
    }, null);
  }, [confirmedItemsStats]);

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
      title: "✅ PAGO RECIBIDO",
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

  const currentChartData = useMemo(() => {
    if (chartPeriod === "daily") return dailyChartData;
    if (chartPeriod === "monthly") return monthlyChartData;
    return weeklyChartData;
  }, [chartPeriod]);

  if (isUserLoading || isOrdersLoading || isReviewsLoading || !mounted) {
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
          <span className="text-xl font-black tracking-tighter text-foreground">UniEats <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full align-middle ml-1">ADMIN</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase px-4 mb-2 tracking-widest">Navegación</p>
          <Button variant="ghost" className="w-full justify-start gap-3 text-primary bg-primary/5 font-bold rounded-xl">
            <BarChart3 size={20} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/menu')}>
            <ClipboardList size={20} /> Gestionar Menú
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

          <div className="pt-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase px-4 mb-2 tracking-widest">Modo Presentación</p>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-secondary/10 group" onClick={() => window.open('/client/menu', '_blank')}>
              <MonitorPlay size={20} className="text-secondary" /> 
              <span>Ver como Alumno</span>
              <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/5 group" onClick={() => window.open('/queue', '_blank')}>
              <Tv size={20} className="text-primary" /> 
              <span>Monitor Público</span>
              <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
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
            <p className="text-muted-foreground font-medium">Control financiero y satisfacción del cliente.</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                          <p className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">Ventas Totales</p>
                          <p className="text-3xl font-black text-primary">$ {reportData[period as keyof typeof reportData].totalSales.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                          <p className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">Transacciones</p>
                          <p className="text-3xl font-black">{reportData[period as keyof typeof reportData].totalTransactions}</p>
                        </div>
                        <div className="bg-secondary/10 p-6 rounded-3xl border-2 border-secondary/20">
                          <p className="text-xs font-black text-secondary-foreground mb-1 uppercase tracking-widest">Satisfacción</p>
                          <p className="text-3xl font-black flex items-center gap-2">{avgRating.toFixed(1)} <Star className="fill-secondary text-secondary h-6 w-6" /></p>
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
                              <TableHead className="font-black text-center">Valoración</TableHead>
                              <TableHead className="font-black text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData[period as keyof typeof reportData].items.map((item: any, idx: number) => (
                              <TableRow key={idx} className="hover:bg-muted/20">
                                <TableCell className="font-bold">{item.name}</TableCell>
                                <TableCell className="text-center font-black text-primary">{item.qty}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="font-black">{item.avgRating?.toFixed(1) || '-'}</span>
                                    {item.avgRating > 0 && <Star size={10} className="fill-secondary text-secondary" />}
                                  </div>
                                </TableCell>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white border-l-[1rem] border-l-primary md:col-span-2">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <Clock className="text-primary" /> PAGOS POR LIBERAR
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {pendingOrders.length === 0 ? (
                <div className="py-10 text-center opacity-40">
                  <CheckCircle2 size={48} className="mx-auto mb-2" />
                  <p className="font-black">Sin pagos pendientes.</p>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <div className="space-y-4 pr-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="p-6 rounded-[2rem] border-2 bg-muted/10 flex justify-between items-center transition-all">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-primary">#{order.id}</span>
                            <Badge variant="outline" className="rounded-full font-black text-[9px] uppercase tracking-widest">
                              {order.method}
                            </Badge>
                          </div>
                          <p className="font-bold text-sm text-muted-foreground mt-1">{order.items?.map((it:any) => it.name).join(', ')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xl font-black">$ {order.totalAmount?.toFixed(2)}</p>
                          <Button 
                            className="rounded-xl font-black h-10 px-4"
                            onClick={() => handleLiberatePayment(order.id)}
                          >
                            LIBERAR
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-secondary text-secondary-foreground overflow-hidden">
             <CardHeader className="p-8 pb-0">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Insight de IA</p>
                 <Heart className="fill-primary text-primary" size={24} />
               </div>
               <CardTitle className="text-3xl font-black leading-tight mt-2">PRODUCTO ESTRELLA</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-6">
                {starProduct ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-black tracking-tighter truncate uppercase">{starProduct.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={cn(s <= Math.round(starProduct.avgRating || 4) ? "fill-primary text-primary" : "text-primary/20")} />
                          ))}
                        </div>
                        <span className="text-xs font-bold opacity-60">({starProduct.ratingsCount} reviews)</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary-foreground/10">
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-60">Vendidos</p>
                        <p className="text-2xl font-black">{starProduct.qty}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-60">Generado</p>
                        <p className="text-2xl font-black">$ {starProduct.total.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center py-10 opacity-40">
                    <p className="font-black italic">Esperando datos...</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-2">
          <CardHeader className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-black">Histórico de Ventas</CardTitle>
            <Tabs defaultValue="weekly" className="w-full md:w-auto" onValueChange={setChartPeriod}>
              <TabsList className="bg-muted/50 rounded-xl p-1 h-10">
                <TabsTrigger value="daily" className="rounded-lg text-[10px] font-black px-4">DIARIO</TabsTrigger>
                <TabsTrigger value="weekly" className="rounded-lg text-[10px] font-black px-4">SEMANAL</TabsTrigger>
                <TabsTrigger value="monthly" className="rounded-lg text-[10px] font-black px-4">MENSUAL</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E30613" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E30613" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: '900', color: '#E30613'}}
                  />
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
