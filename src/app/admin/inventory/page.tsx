'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Search, 
  Box, 
  RotateCcw,
  Scale,
  Droplets,
  Package,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { INGREDIENTS as INITIAL_INGREDIENTS } from '@/lib/data';

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  // Protección de ruta
  useEffect(() => {
    if (!isUserLoading && (!user || user.displayName !== 'admin')) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'ingredients');
  }, [firestore, user]);

  const { data: items, isLoading: isDataLoading } = useCollection(ingredientsQuery);

  const handleStockChange = (id: string, newStock: number) => {
    const itemRef = doc(firestore, 'ingredients', id);
    updateDocumentNonBlocking(itemRef, {
      currentStock: Math.max(0, newStock),
      updatedAt: serverTimestamp()
    });
  };

  const resetToDefault = async () => {
    if (!user) return;
    
    setIsInitializing(true);
    try {
      const batch = writeBatch(firestore);
      INITIAL_INGREDIENTS.forEach((ing) => {
        const docRef = doc(firestore, 'ingredients', ing.id);
        batch.set(docRef, {
          id: ing.id,
          name: ing.name,
          unitOfMeasure: ing.unit,
          currentStock: ing.stock,
          minStockLevel: ing.minStock,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast({
        className: "uni-toast-success",
        title: "🔄 REESTABLECIDO",
        description: "Inventario reiniciado a valores base en la nube.",
      });
    } catch (error) {
      console.error("Error al inicializar:", error);
      toast({
        variant: "destructive",
        title: "❌ ERROR",
        description: "No se pudo inicializar el inventario. Revisa tus permisos.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const filteredItems = items?.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStockStatus = (item: any) => {
    const ratio = item.currentStock / item.minStockLevel;
    if (ratio <= 1) return { color: "text-destructive", bg: "bg-destructive/10", label: "CRÍTICO", progress: "bg-destructive" };
    if (ratio <= 2) return { color: "text-secondary", bg: "bg-secondary/10", label: "BAJO", progress: "bg-secondary" };
    return { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "ÓPTIMO", progress: "bg-emerald-500" };
  };

  const formatHumanStock = (amount: number, unit: string) => {
    if (unit === 'ml') {
      if (amount >= 1000) return `${(amount / 1000).toFixed(2)} L`;
      return `${amount} ml`;
    }
    if (unit === 'gr') {
      if (amount >= 1000) return `${(amount / 1000).toFixed(2)} Kg`;
      return `${amount} gr`;
    }
    return `${amount} ${unit}`;
  };

  if (isUserLoading || (user && isDataLoading)) {
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
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">Almacén Central (Cloud)</h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Sincronizado en tiempo real</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 md:flex-none rounded-xl h-12 px-6 font-bold gap-2" 
            onClick={resetToDefault}
            disabled={isInitializing}
          >
            {isInitializing ? <Loader2 className="animate-spin" /> : <RotateCcw size={20} />}
            Inicializar Almacén
          </Button>
        </div>
      </header>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-6 md:p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-black flex items-center gap-3">
                <Box className="text-primary" /> Inventario Técnico
              </CardTitle>
              <CardDescription className="font-bold">Control de insumos críticos para la operación.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar insumo..." 
                className="pl-12 h-11 rounded-xl bg-muted/20 border-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-8 pt-0">
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              const status = getStockStatus(item);
              const progressValue = Math.min(100, (item.currentStock / (item.minStockLevel * 3)) * 100);
              
              return (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 border-muted hover:border-primary/20 transition-all bg-muted/5">
                  <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-0 md:w-1/3">
                    <div className={cn("w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-colors shadow-sm", status.bg)}>
                      {item.unitOfMeasure === 'ml' ? <Droplets className={status.color} /> : item.unitOfMeasure === 'pzas' ? <Package className={status.color} /> : <Scale className={status.color} />}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black leading-tight">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="rounded-full font-bold uppercase text-[9px]">{item.unitOfMeasure}</Badge>
                        <Badge className={cn("rounded-full font-black text-[9px]", status.bg, status.color)}>{status.label}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 md:px-12 mb-4 md:mb-0">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stock Disponible</span>
                      <span className={cn("text-xs font-black", status.color)}>
                        {formatHumanStock(item.currentStock, item.unitOfMeasure)}
                      </span>
                    </div>
                    <Progress 
                      value={progressValue} 
                      className="h-3 rounded-full bg-muted shadow-inner" 
                      indicatorClassName={status.progress} 
                    />
                  </div>

                  <div className="flex items-center gap-3 justify-end md:w-1/4">
                    <div className="flex flex-col items-end mr-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">Ajuste</span>
                      <Input 
                        type="number" 
                        className="w-20 md:w-24 text-center font-black h-9 rounded-xl border-2" 
                        value={item.currentStock} 
                        onChange={(e) => handleStockChange(item.id, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button 
                      size="icon" 
                      className="rounded-xl h-10 w-10 md:h-12 md:w-12 mcd-gradient shadow-lg"
                      onClick={() => handleStockChange(item.id, item.currentStock + (item.unitOfMeasure === 'ml' || item.unitOfMeasure === 'gr' ? 1000 : 1))}
                    >
                      <PlusCircle size={20} />
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