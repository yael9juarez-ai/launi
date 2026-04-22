
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, ArrowRight, LogIn, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 uni-gradient rounded-lg flex items-center justify-center text-white">
              <UtensilsCrossed size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Uni<span className="text-primary">Eats</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#menu" className="text-sm font-medium hover:text-primary transition-colors">Menú</Link>
            <Link href="#horarios" className="text-sm font-medium hover:text-primary transition-colors">Horarios</Link>
            <Link href="/login" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Iniciar Sesión</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/unieats-hero/1200/600" 
              alt="Cafetería UNI" 
              fill 
              className="object-cover opacity-20"
              priority
              data-ai-hint="university cafeteria"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-6">
                Universidad Nacional de Ingeniería
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground tracking-tight">
                Sabores que impulsan tu <span className="text-primary">éxito</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                La nueva plataforma de gestión de la cafetería UNI. Pre-ordena tu comida favorita, evita colas y disfruta de una experiencia gastronómica moderna.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/20" asChild>
                  <Link href="/client/menu">
                    Ver Menú Hoy <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl" asChild>
                  <Link href="/login">
                    Soy Personal <ShieldCheck className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Experiencia Universitaria Moderna</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Diseñamos UniEats pensando en el ritmo de vida de la comunidad UNI.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Pre-órdenes Rápidas",
                  desc: "Selecciona tus platos desde clase y recógelos sin esperar.",
                  icon: <UtensilsCrossed className="text-primary" size={32} />
                },
                {
                  title: "Identidad Institucional",
                  desc: "Uso de cuenta de correo UNI para mayor seguridad y beneficios.",
                  icon: <LogIn className="text-primary" size={32} />
                },
                {
                  title: "Gestión Inteligente",
                  desc: "IA para recomendaciones y optimización de inventario.",
                  icon: <ShieldCheck className="text-primary" size={32} />
                }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-2xl border bg-background hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="mb-6">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 uni-gradient rounded flex items-center justify-center">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-xl font-bold">UniEats</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Universidad Nacional de Ingeniería - Facultad de Ingeniería de Sistemas
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
