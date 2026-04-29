
"use client";

import { useState, useEffect, useMemo } from 'react';
import { UtensilsCrossed, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export default function QueueDisplayPage() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Auto-login anónimo para el monitor si no hay usuario
  useEffect(() => {
    if (!user && !isUserLoading) {
      signInAnonymously(auth).catch(console.error);
    }
  }, [user, isUserLoading, auth]);

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    // Limit to 50 most recent to avoid large transfers and index issues
    return query(collection(firestore, 'orders'), limit(50));
  }, [firestore, user]);

  const { data: allOrders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Pedidos que se están preparando o acaban de entrar
  const inProcess = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter(o => o.status === 'Preparing' || o.status === 'Pending' || o.status === 'Confirmed')
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [allOrders]);

  // Pedidos listos para recoger
  const ready = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter(o => o.status === 'Ready for Pickup')
      .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [allOrders]);

  const handleBackWithPin = () => {
    if (pinInput === "1234") {
      router.back();
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  if (isUserLoading || (user && isOrdersLoading)) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0A] overflow-hidden flex flex-col text-white">
      <header className="bg-white px-12 py-6 flex items-center justify-between shadow-[0_10px_50px_rgba(0,0,0,0.5)] z-10 border-b-[10px] border-primary">
        <div className="flex items-center gap-10">
          <div 
            className="w-24 h-24 mcd-gradient rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl cursor-pointer"
            onClick={() => setShowPinDialog(true)}
          >
            <UtensilsCrossed size={56} />
          </div>
          <div>
            <h1 className="text-7xl font-black tracking-tighter text-black leading-none">UniEats <span className="text-primary">STATUS</span></h1>
            <p className="text-muted-foreground font-black uppercase text-lg tracking-[0.5em] mt-2 italic">Monitor de Entrega - Campus UNI</p>
          </div>
        </div>
        <div className="bg-[#F3F4F6] px-10 py-4 rounded-[2rem] border-4 border-white shadow-inner">
          <p className="text-8xl font-black text-primary tabular-nums tracking-tighter">
            {time || "--:--"}
          </p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-8 gap-8">
        {/* COLUMNA EN PROCESO */}
        <section className="flex-[0.45] flex flex-col gap-6 bg-white/5 p-10 rounded-[4rem] border-4 border-white/5 relative">
          <div className="flex items-center gap-6 pb-6 border-b-4 border-white/10">
            <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary">
              <Clock size={48} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter">En Proceso</h2>
              <p className="text-primary font-bold tracking-widest uppercase text-sm mt-1">Estamos preparando tu pedido</p>
            </div>
            <Badge className="ml-auto text-5xl h-20 px-8 rounded-[2rem] bg-primary text-white font-black border-none shadow-xl">
              {inProcess.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 scrollbar-hide py-2">
            {inProcess.length === 0 ? (
              <div className="col-span-2 h-full flex flex-col items-center justify-center opacity-10 py-20">
                <UtensilsCrossed size={120} className="mb-4" />
                <p className="text-3xl font-black italic">LISTOS PARA RECIBIR ÓRDENES</p>
              </div>
            ) : (
              inProcess.map(order => (
                <div key={order.id} className="bg-white/10 h-32 rounded-[2.5rem] flex items-center justify-center border-4 border-white/5 animate-in fade-in slide-in-from-bottom duration-500">
                  <span className="text-6xl font-black text-white/70 tracking-tighter">#{order.id}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* COLUMNA LISTOS */}
        <section className="flex-[0.55] flex flex-col gap-6 bg-emerald-500/10 p-10 rounded-[4rem] border-4 border-emerald-500/20 shadow-[0_0_150px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-6 pb-6 border-b-4 border-emerald-500/20">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(16,185,129,0.5)]">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h2 className="text-6xl font-black text-emerald-500 uppercase tracking-tighter">¡Listo!</h2>
              <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm mt-1">Pasa a ventanilla con tu ticket</p>
            </div>
            <Badge className="ml-auto text-6xl h-20 px-10 rounded-[2rem] bg-emerald-500 text-white font-black border-none shadow-2xl">
              {ready.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 overflow-y-auto pr-2 scrollbar-hide py-2">
            {ready.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                <div className="w-32 h-32 border-8 border-emerald-500/30 rounded-full flex items-center justify-center mb-6">
                  <ArrowRight size={64} className="text-emerald-500/30" />
                </div>
                <p className="text-3xl font-black text-emerald-500 italic">ESPERANDO PEDIDOS</p>
              </div>
            ) : (
              ready.map(order => (
                <div key={order.id} className="bg-emerald-500 h-64 rounded-[4rem] flex items-center justify-center border-[12px] border-emerald-300 animate-pulse shadow-[0_0_100px_rgba(16,185,129,0.4)]">
                  <div className="flex flex-col items-center">
                    <span className="text-[12rem] font-black text-white tracking-tighter leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                      {order.id}
                    </span>
                    <span className="text-2xl font-black text-emerald-900/40 uppercase tracking-[0.3em] -mt-4">Entregando</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="h-24 bg-primary flex items-center justify-center px-12 overflow-hidden border-t-8 border-white/10">
        <div className="flex items-center gap-20 whitespace-nowrap animate-marquee">
          <p className="text-3xl font-black text-white">¡MUESTRA TU COMPROBANTE DE PAGO EN VENTANILLA!</p>
          <p className="text-3xl font-black text-white">★</p>
          <p className="text-3xl font-black text-white">UNIEATS - TU COMIDA SIEMPRE A TIEMPO</p>
          <p className="text-3xl font-black text-white">★</p>
          <p className="text-3xl font-black text-white">RECUERDA RECOGER TU PEDIDO CUANDO APAREZCA EN VERDE</p>
        </div>
      </footer>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="rounded-[4rem] p-16 max-w-md border-none bg-white shadow-2xl text-black">
          <DialogHeader className="text-center">
            <DialogTitle className="text-4xl font-black tracking-tighter">SALIR DEL MONITOR</DialogTitle>
          </DialogHeader>
          <div className="py-12">
            <p className="text-center text-muted-foreground font-bold mb-4 uppercase text-xs">PIN DE SEGURIDAD</p>
            <Input 
              type="password" 
              placeholder="••••" 
              className={cn("text-center text-7xl h-32 font-black rounded-[2.5rem] bg-muted border-none", pinError && "animate-bounce ring-4 ring-primary")}
              maxLength={4}
              value={pinInput}
              onChange={(e) => {setPinInput(e.target.value); setPinError(false);}}
            />
          </div>
          <Button className="w-full h-24 text-3xl font-black rounded-[2rem] mcd-gradient" onClick={handleBackWithPin}>
            CONFIRMAR
          </Button>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(30%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
