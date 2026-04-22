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
  Activity
} from 'lucide-react';
import Image from 'next/image';
import { smartMenuRecommendation, SmartMenuRecommendationOutput } from '@/ai/flows/smart-menu-recommendation-flow';
import { useToast } from '@/hooks/use-toast';
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
      title: "Agregado",
      description: `${item.name} se añadió a tu pedido.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F5] pb-20">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 uni-gradient rounded flex items-center justify-center text-white">
              <UtensilsCrossed size={18} />
            </div>
            <span className="text-xl font-bold">UniEats</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cart.length}
                </span>
              )}
            </Button>
            <div className="w-8 h-8 rounded-full bg-muted border overflow-hidden">
               <Image src="https://picsum.photos/seed/user/100/100" alt="Avatar" width={32} height={32} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Turnos Section */}
        <div className="mb-8 p-4 bg-foreground text-white rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Clock className="text-primary" />
            </div>
            <div>
              <p className="text-xs opacity-70">Tiempo estimado de espera</p>
              <p className="text-lg font-bold">~ 12 minutos</p>
            </div>
          </div>
          <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl" asChild>
            <a href="/queue">Ver Cola Real</a>
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar comida, bebidas..." 
              className="pl-10 h-11 bg-white border-none shadow-sm rounded-xl"
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
                className="rounded-full whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations && (
          <div className="mb-12 bg-white rounded-2xl p-6 border shadow-sm border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-primary h-5 w-5" />
              <h2 className="text-lg font-bold">Sugerencias para ti</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-primary">{rec.item}</h3>
                    <p className="text-xs text-muted-foreground leading-tight">{rec.reason}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" onClick={() => addToCart({name: rec.item})}>
                    +
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105"
                  data-ai-hint={item.name}
                />
                <Badge className="absolute top-3 right-3 bg-white/90 text-primary hover:bg-white">
                  S/ {item.price.toFixed(2)}
                </Badge>
              </div>
              <CardHeader className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">{item.category}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1 text-muted-foreground">
                        <Activity size={10} /> Nutrición
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Información Nutricional: {item.name}</DialogTitle>
                        <DialogDescription>Valores aproximados por porción.</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-muted rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Calorías</p>
                          <p className="text-xl font-bold">{item.nutrition.calories} kcal</p>
                        </div>
                        <div className="p-3 bg-muted rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Proteínas</p>
                          <p className="text-xl font-bold">{item.nutrition.protein}g</p>
                        </div>
                        <div className="p-3 bg-muted rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Grasas</p>
                          <p className="text-xl font-bold">{item.nutrition.fat}g</p>
                        </div>
                        <div className="p-3 bg-muted rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Carbohidratos</p>
                          <p className="text-xl font-bold">{item.nutrition.carbs}g</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardTitle className="text-lg font-bold leading-tight">{item.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">{item.description}</CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button className="flex-1 h-10 rounded-xl" onClick={() => addToCart(item)}>
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
          <Button className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-bold flex justify-between items-center px-6">
            <span className="flex items-center gap-3">
              <ShoppingCart /> {cart.length} productos
            </span>
            <span>Ver Pedido <ChevronRight size={18} /></span>
          </Button>
        </div>
      )}
    </div>
  );
}
