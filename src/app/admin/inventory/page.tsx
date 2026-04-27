
"use client";

import { useState, useEffect } from 'react';
import { INGREDIENTS as INITIAL_INGREDIENTS, Ingredient } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Save, 
  AlertTriangle, 
  Search, 
  Database, 
  Box, 
  TrendingDown, 
  PlusCircle, 
  History,
  RotateCcw,
  Scale,
  Droplets
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('uni_inventory');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(INITIAL_INGREDIENTS);
      localStorage.setItem('uni_inventory', JSON.stringify(INITIAL_INGREDIENTS));
    }
  }, []);

  const handleStockChange = (id: string, newStock: number) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, stock: Math.max(0, newStock) } : item
    );
    setItems(updated);
  };

  const saveInventory = () => {
    localStorage.setItem('uni_inventory', JSON.stringify(items));
    toast({
      className: "uni-toast-success",
      title: "📦 INVENTARIO RESGUARDADO",
      description: "Los niveles de stock han sido actualizados globalmente.",
    });
  };

  const resetToDefault = () => {
    setItems(INITIAL_INGREDIENTS);
    localStorage.setItem('uni_inventory', JSON.stringify(INITIAL_INGREDIENTS));
    toast({
      title: "🔄 REESTABLECIDO",
      description: "Inventario reiniciado a valores iniciales.",
    });
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStockStatus = (item: Ingredient) => {
    const ratio = item.stock / (item.minStock * 3);
    if (item.stock <= item.minStock) return { color: "text-destructive", bg: "bg-destructive/10", label: "CRÍTICO", progress: "bg-destructive" };
    if (ratio < 1) return { color: "text-secondary", bg: "bg-secondary/10", label: "BAJO", progress: "bg-secondary" };
    return { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "ÓPTIMO", progress: "bg-emerald-500" };
  };

  // Función para que la gente entienda las cantidades (ml -> Litros, gr -> Kg)
  const formatHumanStock = (amount: number, unit: string) => {
    if (unit === 'ml') {
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)} Litros`;
      return `${amount} ml`;
    }
    if (unit === 'gr') {
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)} Kg`;
      return `${amount} gr`;
    }
    return `${amount} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Gestión de Insumos</h1>
            <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Control Central de Materia Prima</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-6 font-bold gap-2" onClick={resetToDefault}>
            <RotateCcw size={20} /> Reiniciar
          </Button>
          <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2" onClick={saveInventory}>
            <Save size={20} /> Guardar Existencias
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase">Alertas</p>
              <p className="text-2xl font-black">{items.filter(i => i.stock <= i.minStock).length} Insumos Críticos</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Box size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase">Total SKUs</p>
              <p className="text-2xl font-black">{items.length} Ingredientes</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-3xl font-black flex items-center gap-3">
                <Database className="text-primary" /> Panel de Existencias
              </CardTitle>
              <CardDescription className="font-bold">Ajusta los niveles de materia prima para habilitar productos en el menú.</CardDescription>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre (ej. Carne, Pan, Agua)..." 
                className="pl-12 h-12 rounded-2xl border-2 focus:border-primary transition-all bg-muted/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              const status = getStockStatus(item);
              const progressValue = Math.min(100, (item.stock / (item.minStock * 5)) * 100);
              
              return (
                <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] border-2 border-muted hover:border-primary/20 transition-all bg-muted/5">
                  <div className="flex items-center gap-6 mb-4 md:mb-0 md:w-1/3">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", status.bg)}>
                      {item.unit === 'ml' ? <Droplets className={status.color} /> : <Scale className={status.color} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="rounded-full font-bold">{item.unit}</Badge>
                        <Badge className={cn("rounded-full font-black", status.bg, status.color)}>{status.label}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 px-0 md:px-12 mb-4 md:mb-0">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-black text-muted-foreground uppercase">Inventario Real</span>
                      <span className={cn("text-sm font-black", status.color)}>
                        {formatHumanStock(item.stock, item.unit)}
                      </span>
                    </div>
                    <Progress value={progressValue} className="h-3 rounded-full bg-muted shadow-inner" indicatorClassName={status.progress} />
                  </div>

                  <div className="flex items-center gap-3 justify-end md:w-1/4">
                    <div className="flex flex-col items-end mr-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase mb-1">Ajustar ({item.unit})</span>
                      <div className="flex items-center bg-white rounded-2xl border-2 p-1 px-3 shadow-sm">
                        <Input 
                          type="number" 
                          className="w-20 border-none text-center font-black text-lg focus-visible:ring-0" 
                          value={item.stock} 
                          onChange={(e) => handleStockChange(item.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      className="rounded-xl h-12 w-12 mcd-gradient shadow-lg"
                      onClick={() => handleStockChange(item.id, item.stock + (item.unit === 'ml' || item.unit === 'gr' ? 1000 : 10))}
                    >
                      <PlusCircle size={24} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
