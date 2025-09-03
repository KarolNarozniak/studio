
"use client";

import { BarChart2, Globe, Link, Search } from "lucide-react";
import React from 'react';

const techItems = [
  {
    icon: Search,
    title: "Analiza nagłówków",
    description: "Dogłębna weryfikacja technicznych nagłówków wiadomości w celu wykrycia nieprawidłowości i śladów fałszerstwa.",
  },
  {
    icon: Globe,
    title: "Weryfikacja domen",
    description: "Sprawdzanie autentyczności domen nadawcy poprzez porównanie z bazami zaufanych firm spedycyjnych.",
  },
  {
    icon: Link,
    title: "Analiza linków i załączników",
    description: "Bezpieczne skanowanie wszystkich linków i załączników pod kątem złośliwego oprogramowania i phishingowych treści.",
  },
  {
    icon: BarChart2,
    title: "Analiza lingwistyczna",
    description: "Badanie treści pod kątem charakterystycznych wzorców językowych używanych w atakach phishingowych.",
  }
];

export function AdvancedTechSection() {
  return (
    <section className="text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-primary">
        Zaawansowane technologie wykrywania
      </h2>
      <p className="mt-4 text-md md:text-lg text-muted-foreground max-w-3xl mx-auto">
        Nasz system wykorzystuje wielowarstwowe podejście do identyfikacji fałszywych wiadomości.
      </p>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {techItems.map((item) => (
          <TechCard
            key={item.title}
            Icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}

const TechCard = ({ Icon, title, description }: { Icon: React.ElementType, title: string, description: string }) => (
  <div className="bg-card border-2 border-primary/20 rounded-xl p-6 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:border-primary/50">
    <div className="bg-primary/10 rounded-full p-4">
      <Icon className="w-10 h-10 text-primary" />
    </div>
    <h3 className="mt-6 text-xl font-bold text-primary">{title}</h3>
    <p className="mt-2 text-muted-foreground flex-grow">{description}</p>
  </div>
);
