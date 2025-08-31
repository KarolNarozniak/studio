"use client";

const forgeryExamples = [
  {
    title: "Podobna domena",
    description: "Przestępcy rejestrują domeny bardzo podobne do prawdziwych:",
    sender: "dhl-polska0@dpd-delivery.com",
    howToRecognize: "Prawidłowa domena DHL to @dhl.com, a nie @dpd-delivery.com. Zwróć uwagę na zamianę liter 'l' na cyfrę '1' lub dodanie myślników.",
  },
  {
    title: "Literówki",
    description: "Domeny z literówkami łatwymi do przeoczenia:",
    sender: "support@fedexs.com",
    howToRecognize: "Prawidłowa domena to @fedex.com (bez 's'). Przestępcy często dodają lub zamieniają litery, licząc na przeoczenie.",
  },
  {
    title: "Błędna domena krajowa",
    description: "Użycie nieprawidłowego rozszerzenia krajowego:",
    sender: "info@ups-pl.org",
    howToRecognize: "Oficjalna domena UPS w Polsce to @ups.pl, a nie @ups-pl.org. Zwróć uwagę na rozszerzenia .org zamiast .pl oraz dodane myślniki.",
  },
];

export function ForgeryExamples() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-primary text-center mb-12">
        Przykłady fałszerstw adresów e-mail
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forgeryExamples.map((example, index) => (
          <div
            key={index}
            className="bg-card border-2 border-primary/50 rounded-lg p-6 flex flex-col gap-4 transform hover:scale-105 transition-transform duration-300"
          >
            <h3 className="text-xl font-bold bg-primary text-primary-foreground text-center rounded-md py-2">
              {example.title}
            </h3>
            <p className="text-muted-foreground text-center">
              {example.description}
            </p>
            <div className="bg-input rounded-md p-2 text-center">
              <span className="text-sm text-muted-foreground">Nadawca: </span>
              <span className="font-mono text-sm text-foreground">{example.sender}</span>
            </div>
            <div className="bg-primary/20 border border-primary/40 rounded-md p-4 flex-grow">
              <h4 className="font-bold text-primary mb-2">Jak rozpoznać?</h4>
              <p className="text-sm text-foreground/80">{example.howToRecognize}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
