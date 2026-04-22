
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate auth
    setTimeout(() => {
      setLoading(false);
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/client/menu');
      }
      toast({
        title: "Sesión iniciada",
        description: `Bienvenido al sistema UniEats como ${role === 'admin' ? 'Administrador' : 'Estudiante'}.`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F5] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 uni-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
              <UtensilsCrossed size={28} />
            </div>
            <span className="text-3xl font-bold tracking-tight">
              Uni<span className="text-primary">Eats</span>
            </span>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-8 text-center bg-white border-b">
            <CardTitle className="text-2xl font-bold">Acceso Institucional</CardTitle>
            <CardDescription>
              Usa tus credenciales @uni.edu.pe para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-8">
            <div className="flex p-1 bg-muted rounded-lg mb-8">
              <button 
                onClick={() => setRole('client')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'client' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Estudiante / Docente
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Administrador
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" placeholder="usuario@uni.edu.pe" type="email" className="pl-10 h-11" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="text-xs text-primary hover:underline">¿Olvidaste tu clave?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-10 h-11" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-lg font-semibold rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar al Sistema'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Problemas con tu cuenta? Contacta a <span className="text-primary font-medium">Soporte OTIC</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
