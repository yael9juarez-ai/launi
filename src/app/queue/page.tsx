
"use client";

import { useState, useEffect } from 'react';
import { UtensilsCrossed, Clock, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
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

interface Order {
  id: string;
  status: 'pending' | 'preparing' | 'ready';
}

export default function QueueDisplayPage() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadData = () => {
    const saved = localStorage.getItem('kitchen_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadData();
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      loadData();
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);

  const preparing = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  const handleBackWithPin = () => {
    if (pinInput === "1234") {
      router.back();
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  return (
    <div className="h-screen bg-[#121212] overflow-hidden flex flex-col">
      {/* Header Estilo TV */}
      <header className="bg-white px-10 py-8 flex items-center justify-between shadow-2xl z-10 border-b-[8px] border-primary">
        <div className="flex items-center gap-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-16 w-16 bg-muted hover:bg-primary/10 transition-colors"
            onClick={() => {
              setPinInput("");
              setPinError(false);
              setShowPinDialog(true);
            }}
          >
            <ArrowLeft size={32} />
          </Button>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 mcd-gradient rounded-[2.5rem] flex items-center justify-center text-white shadow-xl">
              <UtensilsCrossed size={48} />
            </div>
            <div>
              <h1 className="text-6xl font-black tracking-tighter text-black leading-none">UniEats <span className="text-primary">TV</span></h1>
              <p className="text-muted-foreground font-black uppercase text-sm tracking-[0.4em] mt-1">SISTEMA DE TURNOS UNI</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Hora Local</span>
            <p className="text-7xl font-black text-primary tabular-nums tracking-tighter">
              {time || "--:--"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-10 gap-12">
        {/* Sección: Siguen (En Preparación) */}
        <section className="flex-1 flex flex-col gap-8 bg-white/5 p-10 rounded-[4rem] border-2 border-white/5">
          <div className="flex items-center gap-6 pb-6 border-b-2 border-white/10">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary">
              <Clock size={48} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">PREPARANDO</h2>
              <p className="text-primary font-bold tracking-widest uppercase text-sm mt-1">Tus alimentos están en el fuego</p>
            </div>
            <Badge className="ml-auto text-5xl h-20 px-10 rounded-[2rem] bg-primary text-white font-black border-none">
              {preparing.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-4 scrollbar-hide py-4">
            {preparing.length === 0 ? (
              <div className="col-span-2 h-full flex items-center justify-center opacity-20">
                <p className="text-3xl font-black text-white italic">ESPERANDO ÓRDENES...</p>
              </div>
            ) : (
              preparing.map(order => (
                <div key={order.id} className="bg-white/10 h-48 rounded-[3.5rem] flex items-center justify-center border-4 border-white/5 transition-all hover:bg-white/15">
                  <span className="text-9xl font-black text-white/40 tracking-tighter">{order.id}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sección: En Turno (Listos para recoger) */}
        <section className="flex-1 flex flex-col gap-8 bg-emerald-500/5 p-10 rounded-[4rem] border-2 border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.05)]">
          <div className="flex items-center gap-6 pb-6 border-b-2 border-emerald-500/20">
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h2 className="text-5xl font-black text-emerald-500 uppercase tracking-tighter leading-none">¡EN TURNO!</h2>
              <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm mt-1">Pasa a ventanilla por tu pedido</p>
            </div>
            <Badge className="ml-auto text-5xl h-20 px-10 rounded-[2rem] bg-emerald-500 text-white font-black border-none">
              {ready.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-8 overflow-y-auto pr-4 scrollbar-hide py-4">
            {ready.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-20">
                <p className="text-3xl font-black text-emerald-500 italic">SIN PEDIDOS LISTOS</p>
              </div>
            ) : (
              ready.map(order => (
                <div key={order.id} className="bg-emerald-500 h-64 rounded-[4rem] flex items-center justify-center border-8 border-emerald-400 animate-pulse shadow-[0_0_80px_rgba(16,185,129,0.3)]">
                  <span className="text-[12rem] font-black text-white tracking-tighter drop-shadow-2xl">{order.id}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* PIN Dialog para salir */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="rounded-[4rem] p-16 max-w-md border-none bg-white shadow-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-4xl font-black tracking-tighter">ACCESO RESTRINGIDO</DialogTitle>
            <DialogDescription className="text-xl font-medium mt-4 text-muted-foreground">
              Ingresa el PIN maestro para salir de la vista de TV.
            </DialogDescription>
          </DialogHeader>
          <div className="py-12 space-y-8">
            <Input 
              type="password" 
              placeholder="••••" 
              className={cn(
                "text-center text-7xl h-32 font-black tracking-[0.5em] rounded-[2.5rem] bg-muted border-none transition-all",
                pinError && "bg-destructive/10 text-destructive animate-shake"
              )}
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
            />
            {pinError && <p className="text-destructive text-center font-black text-xl animate-pulse">PIN INCORRECTO</p>}
          </div>
          <Button className="w-full h-24 text-3xl font-black rounded-[2rem] mcd-gradient shadow-2xl shadow-primary/20" onClick={handleBackWithPin}>
            DESBLOQUEAR
          </Button>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
