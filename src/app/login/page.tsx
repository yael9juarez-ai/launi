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
import { UtensilsCrossed, Mail, Lock, Loader2, AlertCircle, UserCircle } from 'lucide-react';
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
      
      // Lógica de autenticación mejorada
      if (email === 'admin' && password === 'admin') {
        router.push('/admin/dashboard');
        toast({
          title: "Acceso Administrativo",
          description: "Bienvenido al panel de control central de UniEats.",
        });
        return;
      }

      if (email.endsWith('@uni.edu.pe')) {
        if (role === 'professor' || role === 'student') {
          router.push('/client/menu');
          toast({
            title: `Sesión como ${role === 'professor' ? 'Profesor' : 'Estudiante'}`,
            description: "Acceso concedido. ¡Buen provecho!",
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
            <CardTitle className="text-2xl font-bold">Acceso al Sistema</CardTitle>
            <CardDescription>
              Selecciona tu rol e ingresa tus credenciales
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-8">
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuario</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudiante UNI</SelectItem>
                    <SelectItem value="professor">Profesor / Docente</SelectItem>
                    <SelectItem value="staff">Personal Administrativo</SelectItem>
                    <SelectItem value="admin">Administrador del Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Usuario o Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="admin o usuario@uni.edu.pe" 
                    className="pl-10 h-11 rounded-xl" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="text-xs text-primary hover:underline">¿Olvidaste tu clave?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-11 rounded-xl" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-lg font-semibold rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar al Sistema'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8 text-center text-xs text-muted-foreground">
            <p>
              Prueba con <span className="font-bold text-foreground">admin / admin</span> para el dashboard.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
