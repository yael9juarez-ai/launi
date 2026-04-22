"use client";

import { UtensilsCrossed, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function QueuePage() {
  const router = useRouter();
  const preparing = ["#102", "#104", "#105", "#107"];
  const ready = ["#098", "#099", "#101"];

  return (
    <div className="min-h-screen bg-[#F7F5F5] p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2" onClick={() => router.back()}>
              <ArrowLeft size={24} />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 uni-gradient rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl">
                <UtensilsCrossed size={32} />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter">TURNO DIGITAL</h1>
                <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Real-Time Order Monitoring</p>
              </div>
            </div>
          </div>
          <div className="text-right bg-white p-6 rounded-3xl shadow-xl border-2 border-primary/5">
            <p className="text-4xl font-black text-primary">12:45 PM</p>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mt-1">15 de Mayo, 2024</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Preparando */}
          <Card className="border-none shadow-2xl rounded-[3rem] bg-[#1a1a1a] text-white overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-10">
              <CardTitle className="flex items-center gap-4 text-4xl font-black tracking-tight">
                <Clock className="text-primary w-10 h-10" />
                EN PROCESO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-2 gap-6">
                {preparing.map(num => (
                  <div key={num} className="bg-white/5 p-10 rounded-[2.5rem] text-center border-2 border-white/5 group hover:border-primary/50 transition-all">
                    <span className="text-6xl font-black tracking-tighter group-hover:text-primary transition-colors">{num}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Listos para Recoger */}
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden border-2 border-emerald-500/20">
            <CardHeader className="bg-emerald-500 p-10">
              <CardTitle className="flex items-center gap-4 text-4xl font-black text-white tracking-tight">
                <CheckCircle2 className="w-10 h-10" />
                LISTOS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-2 gap-6">
                {ready.map(num => (
                  <div key={num} className="bg-emerald-50 p-10 rounded-[2.5rem] text-center border-4 border-emerald-500 animate-pulse">
                    <span className="text-6xl font-black text-emerald-600 tracking-tighter">{num}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 text-center p-10 bg-white/80 backdrop-blur-sm rounded-[2.5rem] border-2 border-white shadow-xl max-w-3xl mx-auto">
          <p className="text-muted-foreground font-bold text-lg leading-relaxed">
            Acércate a la zona de entrega cuando tu número aparezca en <span className="text-emerald-600 font-black">VERDE</span>.
          </p>
        </footer>
      </div>
    </div>
  );
}