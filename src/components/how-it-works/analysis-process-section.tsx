
"use client";

import { Mail, Settings, ShieldCheck, ClipboardCheck, Presentation } from "lucide-react";
import React from 'react';

const processStepsRow1 = [
  { icon: Mail, title: "Odbierz maila", description: "Użytkownik przesyła treść wiadomości" },
  { icon: Settings, title: "Parsowanie", description: "System rozbija wiadomość na składowe elementy" },
  { icon: ShieldCheck, title: "Analiza", description: "Badanie każdego komponentu pod kątem fałszerstwa" },
];

const processStepsRow2 = [
  { icon: Presentation, title: "Prezentacja", description: "Przekazanie wyników użytkownikowi" },
  { icon: ClipboardCheck, title: "Generowanie wyniku", description: "Przygotowanie szczegółowego raportu z analizy" },
];

export function AnalysisProcessSection() {
  return (
    <section className="text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-primary">
        Proces analizy krok po kroku
      </h2>
      <p className="mt-4 text-md md:text-lg text-muted-foreground max-w-3xl mx-auto">
        Jak nasz system przetwarza i bada każdą wiadomość e-mail.
      </p>
      <div className="mt-16 flex flex-col items-center space-y-8">
        {/* First Row */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full">
          {processStepsRow1.map((step, index) => (
            <React.Fragment key={step.title}>
              <ProcessStep Icon={step.icon} title={step.title} description={step.description} />
              {index < processStepsRow1.length - 1 && <Arrow horizontal />}
            </React.Fragment>
          ))}
        </div>

        {/* Connecting Arrow */}
        <div className="w-full flex justify-end md:pr-[12.5%] lg:pr-[16.66%]">
          <Arrow vertical />
        </div>

        {/* Second Row */}
        <div className="flex flex-col-reverse md:flex-row-reverse items-center justify-center w-full">
           {processStepsRow2.map((step, index) => (
            <React.Fragment key={step.title}>
              <ProcessStep Icon={step.icon} title={step.title} description={step.description} />
               {index < processStepsRow2.length - 1 && <Arrow horizontal reverse />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

const ProcessStep = ({ Icon, title, description }: { Icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center w-52 p-4">
        <div className="bg-card border-2 border-primary/70 text-primary rounded-full h-24 w-24 flex items-center justify-center">
            <Icon className="w-12 h-12" />
        </div>
        <h4 className="mt-4 font-bold text-lg text-primary">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
);

const Arrow = ({ horizontal = false, vertical = false, reverse = false }) => {
    let classes = "text-primary";
    if (horizontal) classes += " hidden md:block";
    if (vertical) classes += " hidden md:block transform -rotate-90 md:rotate-0";
    if (reverse && horizontal) classes += " transform rotate-180";
    
    return (
        <div className={classes}>
            {vertical ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            )}
        </div>
    );
};
