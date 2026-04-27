"use client";

import { useState, useEffect, useMemo } from 'react';
import { UtensilsCrossed, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function QueueDisplayPage() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  
  const firestore = useFirestore();
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
  const { data: allOrders } = useCollection(ordersQuery);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const preparing = useMemo(() => 
    allOrders?.filter(o => o.status === 'Preparing') || []
  , [allOrders]);

  const ready = useMemo(() => 
    allOrders?.filter(o => o.status === 'Ready for Pickup') || []
  , [allOrders]);

  const handleBackWithPin = () => {
    if (pinInput === "1234") {
      router.back();
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

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
            <p className="text-muted-foreground font-black uppercase text-lg tracking-[0.5em] mt-2">ORDEN POR MONITOR DE CAMPUS</p>
          </div>
        </div>
        <div className="bg-muted px-10 py-4 rounded-[2rem] border-4 border-white shadow-inner">
          <p className="text-8xl font-black text-primary tabular-nums tracking-tighter">
            {time || "--:--"}
          </p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-12 gap-12">
        <section className="flex-[0.4] flex flex-col gap-8 bg-white/5 p-12 rounded-[5rem] border-4 border-white/5 relative">
          <div className="flex items-center gap-6 pb-8 border-b-4 border-white/10">
            <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary">
              <Clock size={60} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-6xl font-black uppercase tracking-tighter">SIGUEN</h2>
              <p className="text-primary font-bold tracking-widest uppercase text-xl mt-1">En preparación</p>
            </div>
            <Badge className="ml-auto text-6xl h-24 px-12 rounded-[2.5rem] bg-primary text-white font-black border-none shadow-xl">
              {preparing.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-6 overflow-y-auto pr-4 scrollbar-hide py-4">
            {preparing.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-10">
                <p className="text-4xl font-black italic">ESPERANDO PEDIDOS...</p>
              </div>
            ) : (
              preparing.map(order => (
                <div key={order.id} className="bg-white/10 h-40 rounded-[3rem] flex items-center justify-center border-4 border-white/5 animate-in fade-in slide-in-from-left duration-500">
                  <span className="text-8xl font-black text-white/50 tracking-tighter">{order.id}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex-[0.6] flex flex-col gap-8 bg-emerald-500/10 p-12 rounded-[5rem] border-4 border-emerald-500/20 shadow-[0_0_150px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-6 pb-8 border-b-4 border-emerald-500/20">
            <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(16,185,129,0.5)]">
              <CheckCircle2 size={60} />
            </div>
            <div>
              <h2 className="text-7xl font-black text-emerald-500 uppercase tracking-tighter">EN TURNO</h2>
              <p className="text-emerald-400 font-bold tracking-widest uppercase text-xl mt-1">¡Pasa a ventanilla!</p>
            </div>
            <Badge className="ml-auto text-7xl h-24 px-12 rounded-[2.5rem] bg-emerald-500 text-white font-black border-none shadow-2xl">
              {ready.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-8 overflow-y-auto pr-4 scrollbar-hide py-4">
            {ready.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-10">
                <p className="text-4xl font-black text-emerald-500 italic">SIN PEDIDOS LISTOS</p>
              </div>
            ) : (
              ready.map(order => (
                <div key={order.id} className="bg-emerald-500 h-72 rounded-[4rem] flex items-center justify-center border-[12px] border-emerald-300 animate-pulse shadow-[0_0_100px_rgba(16,185,129,0.4)]">
                  <span className="text-[14rem] font-black text-white tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{order.id}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="h-20 bg-primary flex items-center justify-center px-12 overflow-hidden">
        <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
          <p className="text-2xl font-black text-white">¡MUESTRA TU COMPROBANTE DE PAGO EN VENTANILLA!</p>
          <p className="text-2xl font-black text-white">★</p>
          <p className="text-2xl font-black text-white">UNIEATS - CAFETERÍA UNI</p>
          <p className="text-2xl font-black text-white">★</p>
          <p className="text-2xl font-black text-white">BUEN PROVECHO</p>
        </div>
      </footer>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="rounded-[4rem] p-16 max-w-md border-none bg-white shadow-2xl text-black">
          <DialogHeader className="text-center">
            <DialogTitle className="text-4xl font-black tracking-tighter">ADMINISTRACIÓN</DialogTitle>
          </DialogHeader>
          <div className="py-12">
            <Input 
              type="password" 
              placeholder="••••" 
              className={cn("text-center text-7xl h-32 font-black rounded-[2.5rem] bg-muted border-none", pinError && "animate-bounce")}
              maxLength={4}
              value={pinInput}
              onChange={(e) => {setPinInput(e.target.value); setPinError(false);}}
            />
          </div>
          <Button className="w-full h-24 text-3xl font-black rounded-[2rem] mcd-gradient" onClick={handleBackWithPin}>
            SALIR DEL MONITOR
          </Button>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(50%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
