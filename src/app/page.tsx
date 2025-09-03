
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { TrustCheckResult } from "@/lib/types";
import { performTrustCheck } from "@/app/actions";
import FakeOrNotLogo from "@/components/fakeornot-logo";
import { TrustCheckForm } from "@/components/trustcheck-form";
import { TrustCheckResults } from "@/components/trustcheck-results";
import { TrustCheckChat } from "@/components/trustcheck-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';

export default function Home() {
  const [result, setResult] = useState<TrustCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async (formData: FormData) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await performTrustCheck(formData);
      setResult(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <header className="flex items-center justify-between text-center mb-8 border-b-2 border-primary pb-4">
          <div className="flex items-center gap-4">
            <FakeOrNotLogo className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Fake or Not?
            </h1>
          </div>
          <nav className="flex gap-6 text-lg text-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Strona główna</Link>
            <Link href="/how-it-works" className="hover:text-primary transition-colors">Jak to działa?</Link>
            <Link href="/examples" className="hover:text-primary transition-colors">Przykłady fałszerstw</Link>
          </nav>
        </header>

        <Card className="mb-8 shadow-lg border-2 border-primary/50 bg-card">
           <CardHeader className="text-center">
             <CardTitle className="text-3xl text-primary">Analizator Maila i Domen</CardTitle>
           </CardHeader>
          <CardContent className="p-6">
            <TrustCheckForm onSubmit={handleCheck} isLoading={isLoading} />
          </CardContent>
        </Card>
        
        {isLoading && <LoadingSkeleton />}
        {result && (
            <div className="space-y-8">
                <TrustCheckResults result={result} />
                <TrustCheckChat result={result} />
            </div>
        )}

      </main>

      <footer className="w-full max-w-4xl mx-auto text-center mt-auto pt-8">
        <p className="text-sm text-muted-foreground">
          © 2025 North Gate Logistics. Wszelkie prawa zastrzeżone.
        </p>
      </footer>
    </div>
  );
}

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-3/4 mb-2 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
    </CardHeader>
    <CardContent className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </CardContent>
  </Card>
);
