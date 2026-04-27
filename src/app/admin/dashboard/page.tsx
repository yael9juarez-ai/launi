
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
  CalendarClock
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
  const [activeAlerts] = useState(2);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [extraSales, setExtraSales] = useState<number>(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('pending_cash_orders');
    if (saved) setPendingOrders(JSON.parse(saved));
    
    const confirmed = localStorage.getItem('session_confirmed_sales');
    if (confirmed) setExtraSales(parseFloat(confirmed));
  }, []);

  const handleConfirmPayment = (order: any) => {
    const updatedPending = pendingOrders.filter(o => o.id !== order.id);
    setPendingOrders(updatedPending);
    localStorage.setItem('pending_cash_orders', JSON.stringify(updatedPending));

    const newExtra = extraSales + order.total;
    setExtraSales(newExtra);
    localStorage.setItem('session_confirmed_sales', newExtra.toString());

    toast({
      className: "uni-toast-success",
      title: "✅ PAGO CONFIRMADO",
      description: `Se han sumado $${order.total.toFixed(2)} al corte de hoy por el pedido ${order.id}.`,
    });
  };

  const calculatePeriodStats = (records: any[], extra: number) => {
    const totalSales = records.reduce((acc, curr) => acc + curr.totalAmount, 0) + extra;
    const totalTransactions = records.length + (extra > 0 ? 1 : 0);
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    const itemsAggregation: Record<string, { name: string, qty: number, total: number }> = {};
    
    records.forEach(record => {
      record.items.forEach((item: any) => {
        if (!itemsAggregation[item.itemId]) {
          itemsAggregation[item.itemId] = { name: item.itemName, qty: 0, total: 0 };
        }
        itemsAggregation[item.itemId].qty += item.quantity;
        itemsAggregation[item.itemId].total += item.quantity * item.price;
      });
    });

    return {
      totalSales,
      totalTransactions,
      averageTicket,
      items: Object.values(itemsAggregation).sort((a, b) => b.total - a.total)
    };
  };

  const reportStats = useMemo(() => {
    return {
      daily: calculatePeriodStats(SALES_RECORDS, extraSales),
      weekly: calculatePeriodStats([...SALES_RECORDS, ...SALES_RECORDS, ...SALES_RECORDS], extraSales * 5),
      monthly: calculatePeriodStats([...SALES_RECORDS, ...SALES_RECORDS, ...SALES_RECORDS, ...SALES_RECORDS], extraSales * 20),
    };
  }, [extraSales]);

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
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full lg:hidden" onClick={() => router.push('/login')}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground">Panel de Control</h1>
              <p className="text-muted-foreground font-medium">Gestión financiera en tiempo real.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 relative">
                {activeAlerts > 0 ? (
                  <>
                    <BellRing className="text-primary animate-bounce" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-primary text-[10px] text-white items-center justify-center font-bold">
                        {activeAlerts}
                      </span>
                    </span>
                  </>
                ) : (
                  <Bell className="text-muted-foreground" />
                )}
              </Button>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
                  <FileText size={20} /> Generar Reporte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="bg-primary p-8 text-white">
                  <DialogTitle className="text-3xl font-black flex items-center gap-3">
                    <TrendingUp size={32} /> REPORTES FINANCIEROS
                  </DialogTitle>
                  <DialogDescription className="text-white/80 font-medium text-lg">
                    Consolidado de ventas por periodos de tiempo.
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="daily" className="p-8">
                  <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 rounded-2xl p-1 mb-8">
                    <TabsTrigger value="daily" className="rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <CalendarDays size={18} /> DIARIO
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <CalendarClock size={18} /> SEMANAL
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <CalendarRange size={18} /> MENSUAL
                    </TabsTrigger>
                  </TabsList>

                  {['daily', 'weekly', 'monthly'].map((period) => (
                    <TabsContent key={period} value={period} className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Ingresos {period === 'daily' ? 'Hoy' : period === 'weekly' ? 'Semana' : 'Mes'}</p>
                          <p className="text-3xl font-black text-primary">$ {reportStats[period as keyof typeof reportStats].totalSales.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Transacciones</p>
                          <p className="text-3xl font-black">{reportStats[period as keyof typeof reportStats].totalTransactions}</p>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Ticket Promedio</p>
                          <p className="text-3xl font-black">$ {reportStats[period as keyof typeof reportStats].averageTicket.toFixed(2)}</p>
                        </div>
                      </div>

                      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                        <Receipt className="text-primary" /> PRODUCTOS VENDIDOS EN EL PERIODO
                      </h3>
                      <ScrollArea className="h-[300px] border-2 rounded-2xl p-2">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b-2">
                              <TableHead className="font-black text-xs uppercase tracking-widest">Producto</TableHead>
                              <TableHead className="font-black text-xs uppercase tracking-widest text-center">Cantidad</TableHead>
                              <TableHead className="font-black text-xs uppercase tracking-widest text-right">Total (MXN)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportStats[period as keyof typeof reportStats].items.map((item, idx) => (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Ventas Hoy", value: `$ ${reportStats.daily.totalSales.toFixed(2)}`, icon: <DollarSign />, trend: "+12%", color: "text-emerald-500" },
            { label: "Pedidos Activos", value: "24", icon: <Clock />, trend: "8 preparados", color: "text-blue-500" },
            { label: "Usuarios Nuevos", value: "142", icon: <Users />, trend: "+5% esta sem", color: "text-purple-500" },
            { label: "Stock Bajo", value: "3 items", icon: <AlertCircle />, trend: "Revisar ahora", color: "text-primary" },
          ].map((kpi, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</CardTitle>
                <div className={cn("h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center", kpi.color)}>
                  {kpi.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tight">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  <span className={cn("font-bold", kpi.color)}>{kpi.trend}</span> vs ayer
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {pendingOrders.length > 0 && (
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white mb-8 border-l-[1rem] border-l-secondary animate-in slide-in-from-right duration-500">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <Wallet className="text-secondary" /> PENDIENTES DE PAGO EN CAJA
                  </CardTitle>
                  <CardDescription className="font-bold text-muted-foreground">Confirma el cobro para sumar al corte diario.</CardDescription>
                </div>
                <Badge className="h-10 px-6 rounded-full bg-secondary text-black text-lg font-black">{pendingOrders.length} Pendientes</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingOrders.map((order, i) => (
                  <div key={i} className="bg-muted/30 p-6 rounded-[2rem] border-2 border-secondary/20 flex flex-col justify-between hover:border-secondary transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl font-black text-secondary">{order.id}</span>
                        <Badge variant="outline" className="border-secondary/40 text-[10px] font-black">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>
                      </div>
                      <p className="font-black text-lg mb-1">{order.user}</p>
                      <p className="text-sm font-bold text-muted-foreground line-clamp-2">{order.items}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                      <p className="text-2xl font-black text-primary">$ {order.total.toFixed(2)}</p>
                      <Button 
                        size="sm" 
                        className="rounded-xl font-black bg-secondary text-black hover:bg-secondary/80 gap-2"
                        onClick={() => handleConfirmPayment(order)}
                      >
                        <CheckCircle2 size={16} /> CONFIRMAR PAGO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 mb-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-2">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-2xl font-black">Flujo de Ingresos (MXN)</CardTitle>
              <CardDescription className="font-medium">Ventas semanales proyectadas en pesos mexicanos.</CardDescription>
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
                      formatter={(value) => [`$ ${value}`, "Ventas"]}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#E30613" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
