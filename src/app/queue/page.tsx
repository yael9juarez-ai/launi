"use client";

import { UtensilsCrossed, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function QueuePage() {
  const preparing = ["#102", "#104", "#105", "#107"];
  const ready = ["#098", "#099", "#101"];

  return (
    <div className="min-h-screen bg-[#F7F5F5] p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 uni-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
              <UtensilsCrossed size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">ESTADO DE PEDIDOS</h1>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Pantalla de Turnos Digital</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">12:45 PM</p>
            <p className="text-muted-foreground">15 de Mayo, 2024</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Preparando */}
          <Card className="border-none shadow-xl rounded-[2rem] bg-foreground text-white overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-8">
              <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                <Clock className="text-primary w-8 h-8" />
                PREPARANDO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-4">
                {preparing.map(num => (
                  <div key={num} className="bg-white/10 p-8 rounded-3xl text-center border border-white/5">
                    <span className="text-5xl font-black">{num}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Listos para Recoger */}
          <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-primary p-8">
              <CardTitle className="flex items-center gap-3 text-3xl font-bold text-white">
                <CheckCircle2 className="w-8 h-8" />
                LISTOS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-4">
                {ready.map(num => (
                  <div key={num} className="bg-primary/5 p-8 rounded-3xl text-center border-2 border-primary animate-pulse">
                    <span className="text-5xl font-black text-primary">{num}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 text-center p-8 bg-white rounded-3xl shadow-sm">
          <p className="text-muted-foreground font-medium">
            Por favor, acerque su ticket al mostrador cuando vea su número en la sección <span className="text-primary font-bold">LISTOS</span>.
          </p>
        </footer>
      </div>
    </div>
  );
}
