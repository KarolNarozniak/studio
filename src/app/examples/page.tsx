"use client";

import Link from 'next/link';
import FakeOrNotLogo from "@/components/fakeornot-logo";
import { ForgeryExamples } from '@/components/forgery-examples';

export default function ExamplesPage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-5xl mx-auto">
        <header className="flex items-center justify-between text-center mb-8 border-b-2 border-primary pb-4">
          <div className="flex items-center gap-4">
            <FakeOrNotLogo className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Fake or Not?
            </h1>
          </div>
          <nav className="flex gap-6 text-lg text-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Strona główna</Link>
            <a href="#" className="hover:text-primary transition-colors">Jak to działa?</a>
            <Link href="/examples" className="hover:text-primary transition-colors">Przykłady fałszerstw</Link>
          </nav>
        </header>

        <ForgeryExamples />

      </main>

      <footer className="w-full max-w-4xl mx-auto text-center mt-auto pt-8 border-t-2 border-primary mt-12">
        <p className="text-sm text-muted-foreground">
          © 2025 North Gate Logistics. Wszelkie prawa zastrzeżone.
        </p>
      </footer>
    </div>
  );
}
