"use client";

import { useState, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Search, 
  Sparkles, 
  Clock, 
  Star, 
  ChevronRight,
  Activity,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import { smartMenuRecommendation, SmartMenuRecommendationOutput } from '@/ai/flows/smart-menu-recommendation-flow';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ClientMenu() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<SmartMenuRecommendationOutput | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === "Todas" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRecommendations = async () => {
    setLoadingAI(true);
    try {
      const result = await smartMenuRecommendation({
        availableMenuItems: MENU_ITEMS.map(i => ({
          name: i.name,
          description: i.description,
          price: i.price,
          category: i.category
        })),
        popularMenuItems: ["Pizza Pepperoni", "Café Americano"],
        currentPromotions: ["Combo Hamburguesa 10% OFF"]
      });
      setRecommendations(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    getRecommendations();
  }, []);

  const addToCart = (item: any) => {
    setCart([...cart, item]);
    toast({
      className: "uni-toast-info",
      title: "🍴 ¡Buen Provecho!",
      description: (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
             <UtensilsCrossed size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">{item.name} agregado.</p>
            <p className="text-xs text-muted-foreground">Revisa tu pedido abajo.</p>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F5] pb-24">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" onClick={() => router.push('/login')}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 uni-gradient rounded flex items-center justify-center text-white">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-xl font-bold">UniEats</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg">
                  {cart.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border overflow-hidden p-0" onClick={() => router.push('/login')}>
               <Image src="https://picsum.photos/seed/user/100/100" alt="Avatar" width={40} height={40} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Turnos Section */}
        <div className="mb-8 p-6 bg-foreground text-white rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-2xl gap-4">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Clock className="text-primary w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70 uppercase tracking-widest">Espera Estimada</p>
              <p className="text-3xl font-black">~ 12 Minutos</p>
            </div>
          </div>
          <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-2xl h-12 px-8 font-bold" onClick={() => router.push('/queue')}>
            Ver Cola Real
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="¿Qué te apetece hoy? Pizza, café..." 
              className="pl-12 h-12 bg-white border-none shadow-sm rounded-2xl text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["Todas", ...CATEGORIES].map(cat => (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? "default" : "secondary"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full h-12 px-6 font-bold whitespace-nowrap shadow-sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations && (
          <div className="mb-12 bg-white rounded-[2rem] p-8 border-2 shadow-xl border-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-primary h-6 w-6 animate-pulse" />
              <h2 className="text-2xl font-black tracking-tight">Sugerencias para ti</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.recommendations.map((rec, i) => (
                <div key={i} className="flex flex-col justify-between p-6 rounded-3xl bg-primary/5 border-2 border-primary/5 hover:border-primary/20 transition-all group">
                  <div>
                    <h3 className="font-black text-lg text-primary mb-2">{rec.item}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-4 italic">"{rec.reason}"</p>
                  </div>
                  <Button size="lg" variant="outline" className="w-full rounded-2xl font-bold bg-white hover:bg-primary hover:text-white transition-colors" onClick={() => addToCart({name: rec.item})}>
                    Añadir al Pedido
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group border-none shadow-lg rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 bg-white">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={item.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Badge className="absolute top-4 right-4 bg-white/95 text-primary hover:bg-white h-9 px-4 rounded-full text-base font-black shadow-lg">
                  S/ {item.price.toFixed(2)}
                </Badge>
              </div>
              <CardHeader className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="h-7 px-3 rounded-full text-[10px] gap-1 font-bold hover:bg-primary hover:text-white transition-colors">
                        <Activity size={12} /> INFO NUTRICIONAL
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{item.name}</DialogTitle>
                        <DialogDescription className="font-medium">Valores por porción individual.</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-5 bg-primary/5 rounded-3xl text-center border-2 border-primary/5">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Calorías</p>
                          <p className="text-3xl font-black text-primary">{item.nutrition.calories}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">KCAL</p>
                        </div>
                        <div className="p-5 bg-emerald-50 rounded-3xl text-center border-2 border-emerald-100">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Proteínas</p>
                          <p className="text-3xl font-black text-emerald-600">{item.nutrition.protein}g</p>
                          <p className="text-[10px] font-bold text-muted-foreground">MÚSCULO</p>
                        </div>
                        <div className="p-5 bg-amber-50 rounded-3xl text-center border-2 border-amber-100">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Grasas</p>
                          <p className="text-3xl font-black text-amber-600">{item.nutrition.fat}g</p>
                          <p className="text-[10px] font-bold text-muted-foreground">LÍPIDOS</p>
                        </div>
                        <div className="p-5 bg-blue-50 rounded-3xl text-center border-2 border-blue-100">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Carbs</p>
                          <p className="text-3xl font-black text-blue-600">{item.nutrition.carbs}g</p>
                          <p className="text-[10px] font-bold text-muted-foreground">ENERGÍA</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardTitle className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{item.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm font-medium leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => addToCart(item)}>
                  Pedir Ahora
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Quick Access Mobile Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <Button className="w-full h-16 rounded-[2rem] shadow-[0_20px_50px_rgba(227,6,19,0.3)] text-lg font-black flex justify-between items-center px-8 transition-all hover:scale-[1.03]" onClick={() => toast({ title: "Ir al Carrito", description: "Cargando tu pedido...", className: "uni-toast-info" })}>
            <span className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} />
              </div>
              {cart.length} productos
            </span>
            <span className="flex items-center gap-2">Pagar <ChevronRight size={20} /></span>
          </Button>
        </div>
      )}
    </div>
  );
}