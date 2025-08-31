
"use client";

const steps = [
  {
    number: 1,
    title: "Wprowadź maila",
    description: "Skopiuj i wklej adres e-mail do analizatora",
  },
  {
    number: 2,
    title: "Automatyczna analiza",
    description: "Algorytm skanuje maila pod kątem wskaźników fałszerstwa",
  },
  {
    number: 3,
    title: "Otrzymaj raport",
    description: "System generuje raport ze wskazaniem elementów budzących podejrzenie",
  },
];

export function HowItWorks() {
  return (
    <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {steps.map((step) => (
            <div
            key={step.number}
            className="bg-card border-2 border-primary/50 rounded-lg p-8 flex flex-col items-center text-center gap-6"
            >
                <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                    {step.number}
                </div>
                <h2 className="text-2xl font-bold text-primary">{step.title}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                </p>
            </div>
        ))}
        </div>
    </div>
  );
}
