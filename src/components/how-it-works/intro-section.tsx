
"use client";

import React from 'react';

const steps = [
  {
    number: 1,
    title: "Wprowadź treść maila",
    description: "Skopiuj i wklej treść podejrzanej wiadomości e-mail lub załaduj plik .eml bezpośrednio do naszego systemu.",
  },
  {
    number: 2,
    title: "Automatyczna analiza",
    description: "Nasze algorytmy skanują wiadomość pod kątem setek wskaźników fałszerstwa i technik phishingowych.",
  },
  {
    number: 3,
    title: "Otrzymaj szczegółowy raport",
    description: "System generuje szczegółowy raport z oceną ryzyka i wskazaniem konkretnych elementów budzących podejrzenia.",
  },
];

export function IntroSection() {
  return (
    <section className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-primary">
        Jak działa nasz system wykrywania fałszerstw?
      </h1>
      <p className="mt-4 text-md md:text-lg text-muted-foreground max-w-3xl mx-auto">
        Poznaj mechanizmy stojące za naszym zaawansowanym narzędziem do analizy i weryfikacji autentyczności wiadomości e-mail.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-card border-2 border-primary/20 rounded-xl p-8 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:border-primary/50"
          >
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold">
              {step.number}
            </div>
            <h2 className="mt-6 text-2xl font-bold text-primary">{step.title}</h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed flex-grow">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
