
"use client";

import { useState, useMemo } from 'react';
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
  Receipt
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
  const router = useRouter();

  // Cálculo de reporte diario basado en SALES_RECORDS
  const reportStats = useMemo(() => {
    const totalSales = SALES_RECORDS.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTransactions = SALES_RECORDS.length;
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    const itemsAggregation: Record<string, { name: string, qty: number, total: number }> = {};
    
    SALES_RECORDS.forEach(record => {
      record.items.forEach(item => {
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
  }, []);

  return (
    <div className="flex h-screen bg-[#FDFDFD]">
      {/* Sidebar */}
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
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/admin/pos')}>
            <DollarSign size={20} /> Punto de Venta
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" onClick={() => router.push('/queue')}>
            <Clock size={20} /> Pantalla de Turnos
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted">
            <Package size={20} /> Inventario
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

            {/* Diálogo de Reporte */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
                  <FileText size={20} /> Generar Reporte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="bg-primary p-8 text-white">
                  <DialogTitle className="text-3xl font-black flex items-center gap-3">
                    <TrendingUp size={32} /> REPORTE DE CIERRE DIARIO
                  </DialogTitle>
                  <DialogDescription className="text-white/80 font-medium text-lg">
                    Resumen consolidado de ventas al día de hoy.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Ingresos Totales</p>
                      <p className="text-3xl font-black text-primary">$ {reportStats.totalSales.toFixed(2)}</p>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Transacciones</p>
                      <p className="text-3xl font-black">{reportStats.totalTransactions}</p>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-3xl border-2 border-primary/5">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Ticket Promedio</p>
                      <p className="text-3xl font-black">$ {reportStats.averageTicket.toFixed(2)}</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Receipt className="text-primary" /> DESGLOSE DE PRODUCTOS VENDIDOS
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
                        {reportStats.items.map((item, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/20">
                            <TableCell className="font-bold">{item.name}</TableCell>
                            <TableCell className="text-center font-black text-primary">{item.qty}</TableCell>
                            <TableCell className="text-right font-black">$ {item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Ventas Hoy", value: `$ ${reportStats.totalSales.toFixed(2)}`, icon: <DollarSign />, trend: "+12%", color: "text-emerald-500" },
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

        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Main Chart */}
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

        {/* Recent Orders Section */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black">Actividad Reciente</CardTitle>
            <CardDescription className="font-medium">Monitoreo de pedidos en tiempo real.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "#001", user: "Juan Pérez", item: "Pizza Slice", total: "$ 45.00", status: "Listo", time: "5m" },
                { id: "#002", user: "Ana Gómez", item: "Combo Burguesa", total: "$ 110.00", status: "Preparando", time: "12m" },
                { id: "#003", user: "Marco Polo", item: "Café + Muffin", total: "$ 67.00", status: "Pendiente", time: "18m" },
              ].map((order, i) => (
                <div key={i} className="flex items-center justify-between p-5 border-2 border-muted/50 rounded-3xl hover:border-primary/30 transition-all group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {order.id}
                    </div>
                    <div>
                      <p className="font-black text-sm">{order.user}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{order.item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={order.status === 'Listo' ? 'default' : order.status === 'Preparando' ? 'secondary' : 'outline'} className="rounded-full px-3 text-[10px] font-black uppercase">
                      {order.status}
                    </Badge>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1">{order.time} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
