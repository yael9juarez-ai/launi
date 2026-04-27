
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UtensilsCrossed, 
  Users, 
  DollarSign, 
  Package, 
  AlertCircle, 
  BarChart3, 
  Clock, 
  Bell,
  BellRing,
  LogOut,
  ArrowLeft,
  FileText,
  TrendingUp,
  Receipt,
  ChefHat,
  Wallet,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  CreditCard,
  Banknote
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { SALES_RECORDS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const chartData = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3200 },
  { name: 'Mie', sales: 6500 },
  { name: 'Jue', sales: 8900 },
  { name: 'Vie', sales: 5400 },
  { name: 'Sab', sales: 2100 },
];

export default function AdminDashboard() {
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [confirmedSalesTotal, setConfirmedSalesTotal] = useState<number>(0);
  const [confirmedItemsStats, setConfirmedItemsStats] = useState<Record<string, any>>({});
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Cargar verificaciones pendientes de pago (Efectivo y Transferencia)
    const pending = localStorage.getItem('pending_verifications');
    if (pending) setPendingVerifications(JSON.parse(pending));
    
    // Cargar acumulado de ventas confirmadas
    const confirmedTotal = localStorage.getItem('confirmed_sales_total');
    if (confirmedTotal) setConfirmedSalesTotal(parseFloat(confirmedTotal));

    // Cargar desglose de items confirmados
    const itemsStats = localStorage.getItem('confirmed_items_breakdown');
    if (itemsStats) setConfirmedItemsStats(JSON.parse(itemsStats));
  }, []);

  const handleLiberatePayment = (order: any) => {
    // 1. Eliminar de pendientes
    const updatedPending = pendingVerifications.filter(o => o.id !== order.id);
    setPendingVerifications(updatedPending);
    localStorage.setItem('pending_verifications', JSON.stringify(updatedPending));

    // 2. Sumar al total financiero
    const newTotal = confirmedSalesTotal + order.total;
    setConfirmedSalesTotal(newTotal);
    localStorage.setItem('confirmed_sales_total', newTotal.toString());

    // 3. Actualizar estadísticas de productos
    const newStats = { ...confirmedItemsStats };
    order.items.forEach((item: any) => {
      if (!newStats[item.id]) {
        newStats[item.id] = { name: item.name, qty: 0, total: 0 };
      }
      newStats[item.id].qty += 1;
      newStats[item.id].total += item.price;
    });
    setConfirmedItemsStats(newStats);
    localStorage.setItem('confirmed_items_breakdown', JSON.stringify(newStats));

    toast({
      className: "uni-toast-success",
      title: "✅ PAGO LIBERADO",
      description: `Pedido ${order.id} sumado al corte financiero.`,
    });
  };

  const calculateReportData = (periodFactor: number) => {
    const totalSales = (confirmedSalesTotal + SALES_RECORDS[0].totalAmount) * periodFactor;
    const items = Object.values(confirmedItemsStats).map(item => ({
      ...item,
      qty: item.qty * periodFactor,
      total: item.total * periodFactor
    }));

    return {
      totalSales,
      totalTransactions: Math.ceil(totalSales / 60),
      averageTicket: 60,
      items: items.sort((a, b) => b.total - a.total)
    };
  };

  const reportData = useMemo(() => ({
    daily: calculateReportData(1),
    weekly: calculateReportData(5),
    monthly: calculateReportData(20),
  }), [confirmedSalesTotal, confirmedItemsStats]);

  return (
    <div className="flex h-screen bg-[#FDFDFD]">
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-9 h-9 uni-gradient rounded-xl flex items-center justify-center text-white shadow-md">
            <UtensilsCrossed size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter">UniEats <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full align-middle ml-1">ADMIN</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-primary bg-primary/5 font-bold rounded-xl">
            <BarChart3 size={20} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/kitchen')}>
            <ChefHat size={20} /> Cocina
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/pos')}>
            <DollarSign size={20} /> Punto de Venta
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/inventory')}>
            <Package size={20} /> Inventario
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/queue')}>
            <Clock size={20} /> Pantalla de Turnos
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => router.push('/login')}>
            <LogOut size={20} /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Panel Administrativo</h1>
            <p className="text-muted-foreground font-medium">Verificación de ingresos y flujo de caja.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
                <FileText size={20} /> Reportes de Ventas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-primary p-8 text-white">
                <DialogTitle className="text-3xl font-black flex items-center gap-3">
                  <TrendingUp size={32} /> DESGLOSE FINANCIERO
                </DialogTitle>
                <DialogDescription className="text-white/80 font-medium text-lg">
                  Reporte de productos vendidos y liberados en el sistema.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="daily" className="p-8">
                <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 rounded-2xl p-1 mb-8">
                  <TabsTrigger value="daily" className="rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">DIARIO</TabsTrigger>
                  <TabsTrigger value="weekly" className="rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">SEMANAL</TabsTrigger>
                  <TabsTrigger value="monthly" className="rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">MENSUAL</TabsTrigger>
                </TabsList>

                {['daily', 'weekly', 'monthly'].map((period) => (
                  <TabsContent key={period} value={period} className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                        <p className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">Ventas Totales</p>
                        <p className="text-3xl font-black text-primary">$ {reportData[period as keyof typeof reportData].totalSales.toFixed(2)}</p>
                      </div>
                      <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                        <p className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">Cobros Realizados</p>
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
                            <TableHead className="font-black text-xs uppercase tracking-widest">Producto</TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-center">Cant.</TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-right">Total Liberado</TableHead>
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
        </header>

        {/* Verificaciones Pendientes */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white mb-8 border-l-[1rem] border-l-secondary">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Clock className="text-secondary" /> PAGOS PENDIENTES DE LIBERACIÓN
            </CardTitle>
            <CardDescription className="font-bold">Verifica el comprobante o el efectivo para sumar al corte financiero.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {pendingVerifications.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <CheckCircle2 size={48} className="mx-auto mb-2" />
                <p className="font-black">No hay pagos pendientes de verificar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingVerifications.map((order, i) => (
                  <div key={i} className="bg-muted/30 p-6 rounded-[2rem] border-2 border-secondary/20 flex flex-col justify-between hover:border-secondary transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl font-black text-secondary">{order.id}</span>
                        <Badge variant="outline" className="rounded-full font-black gap-2">
                          {order.method === 'transfer' ? <CreditCard size={12} /> : <Banknote size={12} />}
                          {order.method === 'transfer' ? 'TRANS' : 'CASH'}
                        </Badge>
                      </div>
                      <p className="font-black text-lg">{order.user}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{order.items.map((it: any) => it.name).join(', ')}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                      <p className="text-2xl font-black text-primary">$ {order.total.toFixed(2)}</p>
                      <Button 
                        size="sm" 
                        className="rounded-xl font-black bg-secondary text-black hover:bg-secondary/80"
                        onClick={() => handleLiberatePayment(order)}
                      >
                        LIBERAR COBRO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Ventas Liberadas */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-2">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-2xl font-black">Histórico de Ventas Confirmadas</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E30613" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E30613" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$ ${value}`, "Liberado"]}
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
