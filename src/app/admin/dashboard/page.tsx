
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, TrendingUp, Users, DollarSign, Package, AlertCircle, BarChart3, Clock, Sparkles } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { SALES_RECORDS, INVENTORY, MENU_ITEMS } from '@/lib/data';
import { aiSalesInsights, AISalesInsightsOutput } from '@/ai/flows/ai-sales-insights-flow';
import { aiInventoryForecasting, InventoryForecastOutput } from '@/ai/flows/ai-inventory-forecasting-flow';
import { Skeleton } from '@/components/ui/skeleton';

const data = [
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
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAI();
  }, []);

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar (Simple Mock) */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 border-b flex items-center gap-2">
          <div className="w-8 h-8 uni-gradient rounded flex items-center justify-center text-white">
            <UtensilsCrossed size={18} />
          </div>
          <span className="text-xl font-bold">UniEats <span className="text-xs font-normal text-muted-foreground">Admin</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-primary bg-primary/5 font-bold">
            <BarChart3 size={20} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Clock size={20} /> Pedidos
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <UtensilsCrossed size={20} /> Menú
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Package size={20} /> Inventario
          </Button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
            <p className="text-muted-foreground">Métricas en tiempo real y análisis con IA.</p>
          </div>
          <Button className="rounded-xl">Generar Reporte Mensual</Button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Ventas Hoy", value: "S/ 1,240.00", icon: <DollarSign />, trend: "+12%" },
            { label: "Pedidos Activos", value: "24", icon: <Clock />, trend: "8 preparados" },
            { label: "Usuarios Nuevos", value: "142", icon: <Users />, trend: "+5% esta sem" },
            { label: "Stock Bajo", value: "3 items", icon: <AlertCircle className="text-destructive" />, trend: "Revisar ahora" },
          ].map((kpi, i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">{kpi.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">{kpi.trend}</span> vs ayer
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts */}
          <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Ventas por Día</CardTitle>
              <CardDescription>Visualización de ingresos de la última semana.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E30613" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#E30613" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#E30613" fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card className="border-none shadow-sm rounded-2xl bg-foreground text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" />
                Análisis Inteligente
              </CardTitle>
              <CardDescription className="text-muted-foreground">Perspectivas generadas por IA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!salesInsights ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-[90%] bg-white/10" />
                  <Skeleton className="h-4 w-[95%] bg-white/10" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed opacity-90">{salesInsights.summary}</p>
              )}
              {inventoryForecast && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-primary uppercase mb-2">Alerta de Inventario</h4>
                  {inventoryForecast.reorderSuggestions.slice(0, 1).map((s, i) => (
                    <p key={i} className="text-xs">{s.reasoning}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Section (Mock Table) */}
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
            <CardDescription>Monitoreo de actividad en tiempo real.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "#001", user: "Juan Pérez", item: "Pizza Slice", total: "S/ 3.50", status: "Listo", time: "hace 5 min" },
                { id: "#002", user: "Ana Gómez", item: "Combo Burguesa", total: "S/ 5.00", status: "Preparando", time: "hace 12 min" },
                { id: "#003", user: "Marco Polo", item: "Café + Muffin", total: "S/ 2.70", status: "Pendiente", time: "hace 18 min" },
              ].map((order, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                      {order.id}
                    </div>
                    <div>
                      <p className="font-bold">{order.user}</p>
                      <p className="text-xs text-muted-foreground">{order.item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.total}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{order.time}</p>
                  </div>
                  <div>
                    <Badge variant={order.status === 'Listo' ? 'default' : order.status === 'Preparando' ? 'secondary' : 'outline'} className="rounded-full">
                      {order.status}
                    </Badge>
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
