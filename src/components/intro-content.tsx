import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export function IntroContent() {
  return (
    <Card className="bg-card border-border shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center">
            <div className="md:col-span-1 flex justify-center">
                 <Image 
                    src="https://i.ibb.co/NdXRPhzM/dog-main.png" 
                    alt="Byte - the Fake or Not mascot"
                    width={900}
                    height={900}
                    className="object-contain w-full h-auto"
                />
            </div>
            <div className="md:col-span-2 space-y-4 text-foreground/90">
                <p className="text-base leading-relaxed text-justify">
                    <strong>Fake or Not</strong> to inteligentne narzędzie stworzone dla spedytorów i firm
                    logistycznych, które pozwala w kilka sekund zweryfikować, czy mail pochodzi
                    od wiarygodnego partnera. Wystarczy wpisać adres e-mail lub wgrać całego
                    sprawdzanego maila, a system sprawdza szereg kluczowych źródeł - od
                    rejestrów publicznych (REGON, KRS, CEIDG), przez LinkedIn (imię, nazwisko,
                    zatrudnienie), aż po giełdy transportowe takie jak trans.eu, timocom,
                    cargoseller, teleroute czy cargo.pl.
                </p>
                <p className="text-base leading-relaxed text-justify">
                    Platforma analizuje również numery telefonów przypisane do maila, ilość
                    przeprowadzonych zleceń, kody ubezpieczenia, a nawet pozwala na
                    weryfikację pełnej treści wiadomości i stopki z Outlooka. Dzięki temu
                    użytkownik otrzymuje przejrzystą checklistę, a wszystkie dane są zestawione
                    w jednoznaczną ocenę.
                </p>
                <p className="text-base leading-relaxed text-justify italic text-muted-foreground">
                    W centrum całego procesu stoi Byte – wierny policyjny owczarek i maskotka
                    systemu. To on symbolizuje „psie nosy" Fake or Not: skrupulatnie obwąchuje
                    każdy sygnał, ostrzega przed zagrożeniem i daje zielone światło tylko wtedy,
                    gdy ścieżka jest naprawdę bezpieczna. Byte to strażnik wiarygodności, który
                    w kilka chwil rozwiewa wątpliwości spedytora i pozwala działać szybko,
                    pewnie i bez ryzyka.
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
