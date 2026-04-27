
"use client";

import { useState } from 'react';
import { INGREDIENTS, Ingredient } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Save, AlertTriangle, Search, Database, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const [items, setItems] = useState<Ingredient[]>(INGREDIENTS);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleStockChange = (id: string, newStock: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, stock: Math.max(0, newStock) } : item
    ));
  };

  const saveInventory = () => {
    toast({
      className: "uni-toast-success",
      title: "📦 Inventario de Insumos Actualizado",
      description: "Las existencias de materia prima han sido guardadas.",
    });
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Inventario de Insumos</h1>
            <p className="text-muted-foreground font-medium">Control de materia prima e ingredientes.</p>
          </div>
        </div>
        <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2" onClick={saveInventory}>
          <Save size={20} /> Guardar Cambios
        </Button>
      </header>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Database className="text-primary" /> Materia Prima
            </CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar ingrediente..." 
                className="pl-9 h-10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2">
                <TableHead className="font-black text-xs uppercase tracking-widest">Ingrediente</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-center">Unidad</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest">Estado</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-center">Stock Actual</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20 h-20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Box size={20} className="text-muted-foreground" />
                      </div>
                      <span className="font-bold">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-full">{item.unit}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.stock <= item.minStock ? (
                      <Badge variant="destructive" className="rounded-full gap-1 animate-pulse">
                        <AlertTriangle size={12} /> Stock Bajo
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500 text-white rounded-full">Suficiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input 
                      type="number" 
                      className="w-24 mx-auto text-center font-black rounded-xl border-2" 
                      value={item.stock} 
                      onChange={(e) => handleStockChange(item.id, parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="font-bold text-primary" onClick={() => handleStockChange(item.id, item.stock + 50)}>
                      +50
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
