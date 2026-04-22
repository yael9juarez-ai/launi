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
import { UtensilsCrossed, Mail, Lock, Loader2, AlertCircle, UserCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setLoading(false);
      
      if (email === 'admin' && password === 'admin') {
        router.push('/admin/dashboard');
        toast({
          className: "uni-toast-success",
          title: "🔐 ¡Bienvenido, Admin!",
          description: (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="font-bold">Acceso Administrativo Concedido</p>
                <p className="text-xs text-muted-foreground">Redirigiendo al panel de control...</p>
              </div>
            </div>
          ),
        });
        return;
      }

      if (email.endsWith('@uni.edu.pe')) {
        if (role === 'professor' || role === 'student') {
          router.push('/client/menu');
          toast({
            className: "uni-toast-success",
            title: `🏠 ¡Hola de nuevo!`,
            description: `Bienvenido al sistema UniEats como ${role === 'student' ? 'estudiante' : 'profesor'}.`,
          });
        } else {
          setError("El correo institucional solo permite roles de Estudiante o Profesor.");
        }
      } else {
        setError("Credenciales inválidas. Usa 'admin' / 'admin' o un correo @uni.edu.pe");
      }
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
            <CardTitle className="text-3xl font-black tracking-tight">Acceso al Sistema</CardTitle>
            <CardDescription className="text-base font-medium">
              Gestión inteligente de la cafetería UNI
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
                <Label htmlFor="role" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Tipo de Usuario</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all">
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="student">Estudiante UNI</SelectItem>
                    <SelectItem value="professor">Profesor / Docente</SelectItem>
                    <SelectItem value="staff">Personal Administrativo</SelectItem>
                    <SelectItem value="admin">Administrador del Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Usuario o Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="admin o usuario@uni.edu.pe" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary transition-all text-base" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Contraseña</Label>
                  <a href="#" className="text-xs text-primary font-bold hover:underline">¿Olvidaste tu clave?</a>
                </div>
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
            <p className="font-medium">
              Credenciales de prueba: <span className="font-black text-foreground">admin / admin</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}