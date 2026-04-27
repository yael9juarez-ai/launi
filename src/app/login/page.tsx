
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UtensilsCrossed, Mail, Lock, Loader2, AlertCircle, UserPlus, LogIn, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulación de delay de proceso
    setTimeout(async () => {
      let targetPath = '';
      let userRoleName = '';

      if (mode === 'login') {
        // Lógica de acceso por perfiles específicos
        if (email === 'admin' && password === 'admin') {
          targetPath = '/admin/dashboard';
          userRoleName = 'Administrador';
        } else if (email === 'alumno' && password === 'alumno') {
          targetPath = '/client/menu';
          userRoleName = 'Estudiante/Profesor';
        } else if (email === 'cocinero' && password === 'cocinero') {
          targetPath = '/admin/kitchen';
          userRoleName = 'Personal de Cocina';
        } else {
          // Fallback por rol seleccionado
          if (role === 'community') {
            targetPath = '/client/menu';
            userRoleName = 'Comunidad UNI';
          } else if (role === 'staff') {
            targetPath = '/admin/kitchen';
            userRoleName = 'Personal de Staff';
          } else {
            targetPath = '/admin/dashboard';
            userRoleName = 'Administrador';
          }
        }
      } else {
        // MODO REGISTRO (Solo para comunidad)
        targetPath = '/client/menu';
        userRoleName = 'Estudiante/Profesor (Nuevo)';
        
        toast({
          className: "uni-toast-success",
          title: "🎉 ¡CUENTA CREADA!",
          description: `Bienvenido a UniEats, ${name}. Ya puedes ordenar.`,
        });
      }

      // Disparar confirmación por "correo" vía IA (Genkit)
      try {
        sendLoginConfirmationEmail({ 
          email: email || name, 
          role: mode === 'register' ? 'Nuevo Alumno/Profesor' : userRoleName 
        });
        toast({
          className: "uni-toast-info",
          title: "📧 CONFIRMACIÓN ENVIADA",
          description: `Se ha enviado un mensaje de bienvenida.`,
        });
      } catch (e) {
        console.error("Error al enviar confirmación:", e);
      }

      setLoading(false);
      router.push(targetPath);
      
      if (mode === 'login') {
        toast({
          className: "uni-toast-success",
          title: `✅ ¡Hola de nuevo!`,
          description: `Sesión iniciada correctamente.`,
        });
      }
    }, 1200);
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
              {mode === 'login' ? 'Acceso UniEats' : 'Únete a UniEats'}
            </CardTitle>
            <CardDescription className="text-base font-medium">
              {mode === 'login' ? 'Cafetería Universidad UNI' : 'Solo para Alumnos y Profesores'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-10 px-10">
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-2xl border-2">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-bold">Error</AlertTitle>
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {mode === 'login' ? (
                <>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Soy Parte de:</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all">
                        <SelectValue placeholder="Selecciona tu tipo de usuario" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="community">Comunidad UNI (Estudiantes/Profesores)</SelectItem>
                        <SelectItem value="staff">Personal de Cocina / Staff</SelectItem>
                        <SelectItem value="admin">Administrador del Sistema</SelectItem>
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
                        placeholder="Tu nombre aquí" 
                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all text-base" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-reg" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Correo Institucional</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="email-reg" 
                        type="email"
                        placeholder="ejemplo@uni.mx" 
                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all text-base" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

              <Button type="submit" className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : mode === 'login' ? 'Entrar al Sistema' : 'Crear mi Cuenta UNI'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 py-8 bg-muted/20 text-center text-xs text-muted-foreground">
            {mode === 'login' ? (
              <div className="space-y-1">
                <p className="font-medium text-[10px] uppercase tracking-tighter opacity-70">Accesos Directos Prototipo:</p>
                <div className="flex justify-center gap-4">
                  <span className="font-black text-foreground">alumno/alumno</span>
                  <span className="font-black text-foreground">admin/admin</span>
                  <span className="font-black text-foreground">cocinero/cocinero</span>
                </div>
              </div>
            ) : (
              <p className="font-bold px-6">
                Al registrarte, declaras ser parte activa de la comunidad universitaria UNI.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
