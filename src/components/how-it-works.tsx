
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileUp,
  BrainCircuit,
  FileText,
  Search,
  Globe,
  Link,
  BarChart2,
  Mail,
  Settings,
  ShieldCheck,
  ClipboardCheck,
  Presentation,
} from "lucide-react";

export function HowItWorks() {
  return (
    <div className="w-full space-y-16 py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-primary">
          Jak działa nasz system wykrywania fałszerstw?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Poznaj mechanizmy stojące za naszym zaawansowanym narzędziem do
          analizy i weryfikacji autentyczności wiadomości e-mail
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StepCard
          icon={<FileUp />}
          title="1. Wprowadź treść maila"
          description="Skopiuj i wklej treść podejrzanej wiadomości e-mail lub załaduj plik .eml bezpośrednio do naszego systemu."
        />
        <StepCard
          icon={<BrainCircuit />}
          title="2. Automatyczna analiza"
          description="Nasze algorytmy skanują wiadomość pod kątem setek wskaźników fałszerstwa i technik phishingowych."
        />
        <StepCard
          icon={<FileText />}
          title="3. Otrzymaj szczegółowy raport"
          description="System generuje szczegółowy raport z oceną ryzyka i wskazaniem konkretnych elementów budzących podejrzenia."
        />
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-primary">
          Zaawansowane technologie wykrywania
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Nasz system wykorzystuje wielowarstwowe podejście do identyfikacji
          fałszywych wiadomości
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <TechCard
            icon={<Search />}
            title="Analiza nagłówków"
            description="Dogłębna weryfikacja technicznych nagłówków wiadomości w celu wykrycia nieprawidłowości i śladów fałszerstwa."
          />
          <TechCard
            icon={<Globe />}
            title="Weryfikacja domen"
            description="Sprawdzanie autentyczności domen nadawcy poprzez porównanie z bazami zaufanych firm spedycyjnych."
          />
          <TechCard
            icon={<Link />}
            title="Analiza linków i załączników"
            description="Bezpieczne skanowanie wszystkich linków i załączników pod kątem złośliwego oprogramowania i phishingowych treści."
          />
          <TechCard
            icon={<BarChart2 />}
            title="Analiza lingwistyczna"
            description="Badanie treści pod kątem charakterystycznych wzorców językowych używanych w atakach phishingowych."
          />
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-primary">
          Proces analizy krok po kroku
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Jak nasz system przetwarza i bada każdą wiadomość e-mail
        </p>
        <div className="mt-12 flex flex-col items-center">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-12 w-full">
            <ProcessStep icon={<Mail />} title="Odbierz maila" description="Użytkownik przesyła treść wiadomości" />
            <Arrow />
            <ProcessStep icon={<Settings />} title="Parsowanie" description="System rozbija wiadomość na składowe elementy" />
            <Arrow />
            <ProcessStep icon={<ShieldCheck />} title="Analiza" description="Badanie każdego komponentu pod kątem fałszerstwa" />
          </div>
          <div className="w-full flex justify-end my-8 pr-[15%]">
             <div className="h-12 w-12 transform rotate-90">
                <Arrow />
             </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-12 w-full flex-row-reverse">
             <ProcessStep icon={<Presentation />} title="Prezentacja" description="Przekazanie wyników użytkownikowi" />
             <Arrow />
             <ProcessStep icon={<ClipboardCheck />} title="Generowanie wyniku" description="Przygotowanie szczegółowego raportu z analizy" />
          </div>
        </div>
      </section>
    </div>
  );
}

const StepCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="text-center bg-card border-2 border-primary/30">
    <CardHeader>
      <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <CardTitle className="text-2xl text-primary">{title}</CardTitle>
      <CardDescription className="mt-4 text-base text-muted-foreground">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

const TechCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="text-center bg-card p-6 border-2 border-primary/30">
    <div className="mx-auto text-primary h-12 w-12 flex items-center justify-center">
      {React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
    </div>
    <h3 className="mt-4 text-xl font-bold text-primary">{title}</h3>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </Card>
);

const ProcessStep = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center w-48">
        <div className="bg-primary/10 border-2 border-primary/50 text-primary rounded-full h-20 w-20 flex items-center justify-center">
            {React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
        </div>
        <h4 className="mt-4 font-bold text-lg text-primary">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);

const Arrow = () => (
    <div className="text-primary hidden md:block">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
    </div>
)
