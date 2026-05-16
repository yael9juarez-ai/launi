"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Root page that handles the initial redirect to the login screen.
 * Uses a mounted state to prevent hydration mismatches during the redirect.
 */
export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect immediately to login on app start
    router.push('/login');
  }, [router]);

  // Avoid rendering anything until the client has mounted to prevent hydration errors
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Cargando UniEats...</p>
      </div>
    </div>
  );
}
