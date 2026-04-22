
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UtensilsCrossed, 
  Users, 
  DollarSign, 
  Package, 
  AlertCircle, 
  BarChart3, 
  Clock, 
  Sparkles,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { SALES_RECORDS, INVENTORY } from '@/lib/data';
import { aiSalesInsights, AISalesInsightsOutput } from '@/ai/flows/ai-sales-insights-flow';
import { aiInventoryForecasting, InventoryForecastOutput } from '@/ai/flows/ai-inventory-forecasting-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const chartData = [
  { name: 'Lun', sales: 400 },
  { name: 'Mar', sales: 300 },
  { name: 'Mie', sales: 600 },
  { name: 'Jue', sales: 800 },
  { name: 'Vie', sales: 500 },
  { name: 'Sab', sales: 200 },
];

export default function AdminDashboard() {
  const [salesInsights, setSalesInsights] = useState<AISalesInsightsOutput | null>(null);
  const [inventoryForecast, setInventoryForecast] = useState<InventoryForecastOutput | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    const fetchAI = async () => {
      setLoadingAI(true);
      try {
        const insights = await aiSalesInsights({
          salesRecords: SALES_RECORDS,
          dateRange: "Últimos 7 días"
        });
        setSalesInsights(insights);

        const forecast = await aiInventoryForecasting({
          salesHistory: SALES_RECORDS.map(s => ({
            itemId: s.items[0].itemId,
            itemName: s.items[0].itemName,
            quantitySold: s.items[0].quantity,
            date: s.timestamp
          })),
          upcomingEvents: [
            { eventName: "Semana de Exámenes", date: new Date().toISOString(), type: "exam week", expectedAttendance: 5000, impactOnCafeteria: "high" }
          ],
          menuChanges: [],
          currentInventory: INVENTORY,
          ingredientRecipes: [],
          forecastingPeriodDays: 7
        });
        setInventoryForecast(forecast);
        if (forecast) setActiveAlerts(forecast.reorderSuggestions.length);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAI();
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
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted" asChild>
            <a href="/admin/pos"><DollarSign size={20} /> Punto de Venta</a>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted">
            <Clock size={20} /> Pedidos
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-muted">
            <Package size={20} /> Inventario
          </Button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Panel de Control</h1>
            <p className="text-muted-foreground font-medium">Análisis en tiempo real impulsado por IA.</p>
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
            <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">Generar Reporte</Button>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Ventas Hoy", value: "S/ 1,240.00", icon: <DollarSign />, trend: "+12%", color: "text-emerald-500" },
            { label: "Pedidos Activos", value: "24", icon: <Clock />, trend: "8 preparados", color: "text-blue-500" },
            { label: "Usuarios Nuevos", value: "142", icon: <Users />, trend: "+5% esta sem", color: "text-purple-500" },
            { label: "Stock Bajo", value: "3 items", icon: <AlertCircle />, trend: "Revisar ahora", color: "text-primary" },
          ].map((kpi, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-black">Flujo de Ingresos</CardTitle>
              <CardDescription className="font-medium">Ventas semanales proyectadas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
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
                    />
                    <Area type="monotone" dataKey="sales" stroke="#E30613" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* New Interactive Notification Center */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-foreground text-white overflow-hidden flex flex-col">
            <CardHeader className="bg-white/5 border-b border-white/10 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <Sparkles className="text-primary" size={24} />
                  IA Center
                </CardTitle>
                <CardDescription className="text-white/60 font-medium">Alertas de Restaurante</CardDescription>
              </div>
              <Badge variant="outline" className="text-primary border-primary animate-pulse">LIVE</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {/* Alert Ticket 1 */}
                  {!inventoryForecast ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full bg-white/10 rounded-3xl" />
                      <Skeleton className="h-24 w-full bg-white/10 rounded-3xl" />
                    </div>
                  ) : (
                    inventoryForecast.reorderSuggestions.map((s, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] relative group hover:bg-white/10 transition-colors">
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-full" />
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Reabastecimiento</span>
                          <span className="text-[10px] text-white/40">AHORA</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">{s.ingredientName}</h4>
                        <p className="text-xs text-white/60 leading-relaxed mb-3">{s.reasoning}</p>
                        <div className="flex justify-between items-center">
                          <Badge className="bg-primary/20 text-primary border-none text-[10px]">Sug: {s.suggestedReorderQuantity} {s.unit}</Badge>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-white/20">
                            <ChevronRight size={14} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Insight Ticket */}
                  {salesInsights && (
                    <div className="bg-primary/10 border border-primary/20 p-5 rounded-[2rem] relative mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Insight de Ventas</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed italic text-white/90">
                        "{salesInsights.summary.slice(0, 150)}..."
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-6 bg-white/5 border-t border-white/10">
                <Button className="w-full rounded-2xl h-12 bg-white text-foreground hover:bg-white/90 font-bold">
                  Ver Todas las Alertas
                </Button>
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
                { id: "#001", user: "Juan Pérez", item: "Pizza Slice", total: "S/ 3.50", status: "Listo", time: "5m" },
                { id: "#002", user: "Ana Gómez", item: "Combo Burguesa", total: "S/ 5.00", status: "Preparando", time: "12m" },
                { id: "#003", user: "Marco Polo", item: "Café + Muffin", total: "S/ 2.70", status: "Pendiente", time: "18m" },
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
