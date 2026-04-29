
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UtensilsCrossed, Mail, Lock, Loader2, UserPlus, LogIn, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { signInAnonymously, updateProfile } from 'firebase/auth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('community');
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      if (user.displayName === 'admin') router.push('/admin/dashboard');
      else if (user.displayName === 'cocinero') router.push('/admin/kitchen');
      else router.push('/client/menu');
    }
  }, [user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInAnonymously(auth);
      await updateProfile(userCredential.user, {
        displayName: email.toLowerCase()
      });

      let targetPath = '/client/menu';
      if (email.toLowerCase() === 'admin') targetPath = '/admin/dashboard';
      else if (email.toLowerCase() === 'cocinero') targetPath = '/admin/kitchen';

      toast({
        className: "uni-toast-success",
        title: "¡BIENVENIDO!",
        description: `Accediendo como ${email}...`,
      });

      router.push(targetPath);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ERROR DE CONEXIÓN",
        description: "Revisa tu conexión a internet e intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

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
          </CardHeader>
          <CardContent className="pt-10 px-10">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Nombre / Usuario</Label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="admin, cocinero, nombre..." 
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
            <p className="w-full font-bold text-xs opacity-60 tracking-widest uppercase">Sistema UNI de Gestión Cafetería</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
