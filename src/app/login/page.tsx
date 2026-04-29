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
import { sendLoginConfirmationEmail } from '@/ai/flows/send-login-email-flow';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('community');
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      if (email === 'admin') router.push('/admin/dashboard');
      else if (email === 'cocinero') router.push('/admin/kitchen');
      else router.push('/client/menu');
    }
  }, [user, email, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Autenticación Anónima para el MVP (Rápida y multi-dispositivo)
      const userCredential = await signInAnonymously(auth);
      const displayName = mode === 'login' ? (email || 'Usuario UniEats') : name;
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      let targetPath = '/client/menu';
      let userRoleName = 'Alumno/Profesor';

      if (mode === 'login') {
        if (email === 'admin') {
          targetPath = '/admin/dashboard';
          userRoleName = 'Admin';
        } else if (email === 'cocinero') {
          targetPath = '/admin/kitchen';
          userRoleName = 'Personal de Cocina';
        }
      }

      // IA Email (Opcional, no bloqueante)
      sendLoginConfirmationEmail({ 
        email: displayName, 
        role: userRoleName 
      }).catch(() => {});

      toast({
        className: "uni-toast-success",
        title: "¡HOLA DE NUEVO!",
        description: `Sesión iniciada como ${displayName}.`,
      });

      router.push(targetPath);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "ERROR DE CONEXIÓN",
        description: "No se pudo sincronizar con la cafetería. Intenta de nuevo.",
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
            <span className="text-3xl font-black tracking-tighter">
              Uni<span className="text-primary">Eats</span>
            </span>
          </div>
        </div>

        <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="space-y-2 pb-8 text-center border-b">
            <div className="flex justify-center gap-4 mb-4">
              <Button 
                variant={mode === 'login' ? 'default' : 'ghost'} 
                className={cn("rounded-full font-black px-6", mode === 'login' && "shadow-lg shadow-primary/20")}
                onClick={() => setMode('login')}
              >
                <LogIn size={18} className="mr-2" /> ENTRAR
              </Button>
              <Button 
                variant={mode === 'register' ? 'default' : 'ghost'} 
                className={cn("rounded-full font-black px-6", mode === 'register' && "shadow-lg shadow-primary/20")}
                onClick={() => setMode('register')}
              >
                <UserPlus size={18} className="mr-2" /> REGISTRO
              </Button>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">
              {mode === 'login' ? 'Acceso Cafetería' : 'Registro UNI'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-10 px-10">
            <form onSubmit={handleAuth} className="space-y-6">
              {mode === 'login' ? (
                <>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Tu Perfil</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="community">Alumno / Docente</SelectItem>
                        <SelectItem value="staff">Cocina</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Nombre / Usuario</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
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
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Escribe tu nombre" 
                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all text-base" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="font-black text-xs uppercase tracking-widest text-muted-foreground">PIN o Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all text-base" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/30" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : mode === 'login' ? 'ENTRAR' : 'REGISTRARME'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="py-8 bg-muted/20 text-center flex flex-col gap-2">
            <p className="font-bold text-xs opacity-60 tracking-widest uppercase">Sistema de Gestión Institucional UniEats</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
