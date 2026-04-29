'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Lock, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { signInAnonymously, updateProfile, signOut } from 'firebase/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      const name = user.displayName?.toLowerCase();
      if (name === 'admin') router.push('/admin/dashboard');
      else if (name === 'cocinero') router.push('/admin/kitchen');
      else router.push('/client/menu');
    }
  }, [user, router, loading]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signOut(auth);
      
      const userCredential = await signInAnonymously(auth);
      const name = email.trim().toLowerCase();
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      let targetPath = '/client/menu';
      if (name === 'admin') targetPath = '/admin/dashboard';
      else if (name === 'cocinero') targetPath = '/admin/kitchen';

      toast({
        className: "uni-toast-success",
        title: "¡BIENVENIDO!",
        description: `Accediendo como ${name}...`,
      });

      router.push(targetPath);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ERROR DE ACCESO",
        description: "No se pudo iniciar sesión. Revisa tu conexión.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F5]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F5] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 mcd-gradient rounded-xl flex items-center justify-center text-white shadow-xl">
              <UtensilsCrossed size={28} />
            </div>
            <span className="text-3xl font-black tracking-tighter text-foreground">
              Uni<span className="text-primary">Eats</span>
            </span>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="space-y-2 pb-8 text-center border-b">
            <CardTitle className="text-3xl font-black tracking-tight">Acceso Institucional</CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Campus Universidad UNI</p>
          </CardHeader>
          <CardContent className="pt-10 px-10">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Usuario / Perfil</Label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="admin, cocinero o tu nombre" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all text-base" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••"
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all text-base" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/30" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'ENTRAR'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="py-8 bg-muted/20 text-center">
            <p className="w-full font-bold text-xs opacity-60 tracking-widest uppercase">Sistema de Gestión UNI - Cafetería</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}