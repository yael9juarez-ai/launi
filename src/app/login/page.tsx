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
import { UtensilsCrossed, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendLoginConfirmationEmail } from '@/ai/flows/send-login-email-flow';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('community');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulación de delay de login
    setTimeout(async () => {
      let targetPath = '';
      let userRoleName = '';

      // Lógica de acceso por perfiles específicos (sin consecuencia en funcionalidad)
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
        // Fallback por rol seleccionado si no se usan credenciales universales
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

      // Disparar confirmación por "correo" vía IA (Genkit)
      try {
        sendLoginConfirmationEmail({ email, role: userRoleName });
        toast({
          className: "uni-toast-info",
          title: "📧 CONFIRMACIÓN ENVIADA",
          description: `Se ha enviado un correo de bienvenida a ${email}.`,
        });
      } catch (e) {
        console.error("Error al enviar confirmación:", e);
      }

      setLoading(false);
      router.push(targetPath);
      
      toast({
        className: "uni-toast-success",
        title: `✅ ¡Bienvenido!`,
        description: `Sesión iniciada como ${userRoleName}.`,
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F5] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 uni-gradient rounded-xl flex items-center justify-center text-white shadow-xl">
              <UtensilsCrossed size={28} />
            </div>
            <span className="text-3xl font-black tracking-tighter">
              Uni<span className="text-primary">Eats</span>
            </span>
          </div>
        </div>

        <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="space-y-2 pb-8 text-center border-b">
            <CardTitle className="text-3xl font-black tracking-tight">Acceso UniEats</CardTitle>
            <CardDescription className="text-base font-medium">
              Cafetería Universidad UNI - México
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-10 px-10">
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-2xl border-2">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-bold">Error de Acceso</AlertTitle>
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Soy Parte de:</Label>
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
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Entrar al Sistema'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 py-8 bg-muted/20 text-center text-xs text-muted-foreground">
            <div className="space-y-1">
              <p className="font-medium">
                Alumnos: <span className="font-black text-foreground">alumno / alumno</span>
              </p>
              <p className="font-medium">
                Admin: <span className="font-black text-foreground">admin / admin</span>
              </p>
              <p className="font-medium">
                Cocina: <span className="font-black text-foreground">cocinero / cocinero</span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
