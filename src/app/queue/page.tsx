
"use client";

import { useState, useEffect } from 'react';
import { UtensilsCrossed, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogFooter,
} from "@/components/ui/dialog";

export default function QueueDisplayPage() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Mock Queue Data
  const preparing = ["#108", "#110", "#112", "#113"];
  const ready = ["#102", "#105", "#107"];

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      {/* Header */}
      <header className="bg-white px-10 py-8 flex items-center justify-between shadow-2xl z-10">
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
            <div className="w-20 h-20 mcd-gradient rounded-[2rem] flex items-center justify-center text-white shadow-xl">
              <UtensilsCrossed size={48} />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-black">UniEats <span className="text-primary">TV</span></h1>
              <p className="text-muted-foreground font-black uppercase text-xs tracking-[0.4em]">Estado de Pedidos en Tiempo Real</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-7xl font-black text-primary tabular-nums tracking-tighter">
            {time || "--:--"}
          </p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-10 gap-10">
        {/* Preparing Section */}
        <section className="flex-1 flex flex-col gap-8">
          <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2.5rem]">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Clock size={40} className="animate-spin-slow" />
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Preparando</h2>
            <Badge className="ml-auto text-4xl h-16 px-8 rounded-2xl bg-primary text-white font-black">{preparing.length}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-4 scrollbar-hide">
            {preparing.map(num => (
              <div key={num} className="bg-white/10 h-40 rounded-[3rem] flex items-center justify-center border-4 border-white/5 transition-transform hover:scale-105">
                <span className="text-8xl font-black text-white/50">{num}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ready Section */}
        <section className="flex-1 flex flex-col gap-8">
          <div className="flex items-center gap-6 bg-emerald-500/10 p-6 rounded-[2.5rem]">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-5xl font-black text-emerald-500 uppercase tracking-tighter">¡Listo!</h2>
            <Badge className="ml-auto text-4xl h-16 px-8 rounded-2xl bg-emerald-500 text-white font-black">{ready.length}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-4 scrollbar-hide">
            {ready.map(num => (
              <div key={num} className="bg-emerald-500 h-40 rounded-[3rem] flex items-center justify-center border-4 border-emerald-400 animate-pulse shadow-[0_0_60px_rgba(16,185,129,0.4)] transition-transform hover:scale-110">
                <span className="text-9xl font-black text-white">{num}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="rounded-[3rem] p-12 max-w-md border-none bg-white">
          <DialogHeader className="text-center">
            <DialogTitle className="text-4xl font-black">ACCESO RESTRINGIDO</DialogTitle>
            <DialogDescription className="text-xl font-medium mt-4">
              Ingresa el PIN maestro para salir de la visualización de turnos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-10 space-y-6">
            <Input 
              type="password" 
              placeholder="••••" 
              className={cn(
                "text-center text-6xl h-24 font-black tracking-[0.5em] rounded-[2rem] bg-muted border-none",
                pinError && "border-4 border-destructive animate-bounce"
              )}
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
            />
            {pinError && <p className="text-destructive text-center font-black text-lg">PIN INCORRECTO</p>}
          </div>
          <Button className="w-full h-20 text-2xl font-black rounded-3xl mcd-gradient" onClick={handleBackWithPin}>
            DESBLOQUEAR
          </Button>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
