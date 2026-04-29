'use client';

import { useState } from 'react';
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
import { useAuth } from '@/firebase';
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
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Autenticación Anónima para el MVP
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

      // Intentamos enviar el correo de confirmación (IA), pero no bloqueamos el inicio de sesión si falla
      sendLoginConfirmationEmail({ 
        email: displayName, 
        role: userRoleName 
      }).catch(err => console.warn("No se pudo generar el correo de bienvenida (IA):", err));

      toast({
        className: "uni-toast-success",
        title: "BIENVENIDO",
        description: `Sesión iniciada como ${displayName}.`,
      });

      router.push(targetPath);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar sesión. Revisa tu conexión a internet.",
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
              {mode === 'login' ? 'Acceso UniEats' : 'Registro Comunidad'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-10 px-10">
            <form onSubmit={handleAuth} className="space-y-6">
              {mode === 'login' ? (
                <>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Tipo de Usuario</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all">
                        <SelectValue placeholder="Selecciona tu perfil" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="community">Estudiante / Profesor</SelectItem>
                        <SelectItem value="staff">Personal de Cocina</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Usuario</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="email" 
                        placeholder="admin, alumno, cocinero..." 
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
                <Label htmlFor="password" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Contraseña</Label>
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
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : mode === 'login' ? 'Iniciar Sesión' : 'Registrarme'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="py-8 bg-muted/20 text-center text-xs text-muted-foreground flex flex-col gap-2">
            <p className="font-bold opacity-60">Acceso Universitario Seguro</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
