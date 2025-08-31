
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const Warning = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 flex items-start gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
    <AlertTriangle className="h-6 w-6 flex-shrink-0 text-destructive" />
    <div className="flex-1">
      <p className="font-bold">UWAGA!</p>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  </div>
);

const InstructionSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="mb-4 text-2xl font-bold text-primary">{title}</h2>
    {children}
  </section>
);

const SubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="mb-2 text-xl font-semibold text-foreground/90">{title}</h3>
        {children}
    </div>
);

const NumberedList = ({ items }: { items: string[] }) => (
    <ol className="list-decimal space-y-2 pl-6 text-foreground/80">
        {items.map((item, index) => <li key={index}>{item}</li>)}
    </ol>
);

const SubList = ({ items }: { items: string[] }) => (
    <ul className="list-[lower-alpha] space-y-2 pl-6 text-foreground/80">
        {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
);


export function Instruction() {
  return (
    <Card className="bg-card p-6 sm:p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-4xl font-bold text-primary">
          WERYFIKACJA PRZEWOŹNIKA
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          INSTRUKCJA POSTĘPOWANIA PRZED ZREALIZOWANIEM ZLECENIA Z PRZEWOŹNIKIEM
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <InstructionSection title="Weryfikacja dokumentów rejestrowych przewoźnika">
            <SubSection title="PRZEWOŹNIK KRAJOWY">
                <NumberedList items={[
                    "Pozyskaj KRS, gdy spółka prawa handlowego i porównaj z KRS",
                    "Pozyskaj CEIDG, gdy działalność gospodarcza i porównaj z CEIDG",
                    "Porównaj otrzymane dokumenty od przewoźnika z danymi zarejestrowanymi na giełdach. W przypadku niespójności danych – zakaz wyboru tego podwykonawcy bez weryfikacji przełożonego",
                    "Podepnij wszystkie wymagane dokumenty pod kartotekę przewoźnika w systemie SPEDTRANS"
                ]} />
                <Warning>
                    Gdy brak lub jakakolwiek niezgodność danych w powyższych dokumentach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA.
                </Warning>
            </SubSection>
            <SubSection title="PRZEWOŹNIK ZAGRANICZNY">
                <NumberedList items={[
                     "Pozyskaj dokument rejestrowy działalności przewoźnika odpowiedni dla kraju, w którym zarejestrowany jest przewoźnik REJESTR KRAJÓW - WERYFIKACJA KONTRAHENTA",
                     "Sprawdź dane przewoźnika z rejestrem przedsiębiorstw VIES:",
                ]} />
                <SubList items={[
                    "jeżeli siedziba przewoźnika znajduję się w UE sprawdź, czy podmiot jest aktywny",
                    "jeżeli siedziba przewoźnika znajduję się poza UE zakaz jazdy, jeżeli firma nie jest zarejestrowana na giełdach transportowych"
                ]} />
                <NumberedList items={[
                    "Porównaj otrzymane dokumenty od przewoźnika z danymi zarejestrowanymi na giełdach. W przypadku niespójności danych – zakaz wyboru tego podwykonawcy bez weryfikacji przełożonego",
                    "Podepnij wszystkie wymagane dokumenty pod kartotekę przewoźnika w systemie SPEDTRANS"
                ]}/>
                 <Warning>
                    Gdy brak lub jakakolwiek niezgodność danych w powyższych dokumentach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA.
                </Warning>
            </SubSection>
        </InstructionSection>

        <InstructionSection title="Kontrola licencji na wykonywanie transportu">
            <SubSection title="PRZEWOŹNIK KRAJOWY">
                <NumberedList items={[
                    "Gdy spedycja – uzyskaj Licencje na wykonywanie transportu drogowego w zakresie pośrednictwa przy przewozie rzeczy",
                    "Gdy przewoźnik – uzyskaj Licencje na:",
                ]}/>
                <SubList items={[
                     "Transport krajowy – Zezwolenie na wykonywanie zawodu przewoźnika drogowego. Do przewozu w transporcie krajowym uprawnia również Licencja dotycząca międzynarodowego zarobkowego przewozu drogowego rzeczy",
                     "Transport międzynarodowy – Licencja dotycząca międzynarodowego zarobkowego przewozu drogowego rzeczy"
                ]} />
                <NumberedList items={[
                    "Sprawdź, czy licencja jest aktualna oraz odnotowana w bazie KREPTD - instrukcja do sprawdzenia.",
                    "Gdy brak powyższych dokumentów – ZAKAZ WSPÓŁPRACY z wyjątkiem krajowego transportu pojazdami do 3,5t DMC"
                ]} />
                <Warning>
                    Gdy brak lub jakakolwiek niezgodność danych w powyższych dokumentach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA.
                </Warning>
            </SubSection>
            <SubSection title="PRZEWOŹNIK ZAGRANICZNY">
                <NumberedList items={[
                    "Gdy spedycja – Licencja spedycyjna - nazewnictwo indywidualne dla każdego kraju",
                    "Gdy przewoźnik:",
                ]} />
                <SubList items={[
                    "z UE: Licencja wspólnotowa dotycząca międzynarodowego zarobkowego przewozu drogowego rzeczy",
                    "spoza UE: Licencja indywidualna dla danego kraju pozwalająca na wykonywanie transportu międzynarodowego – należy każdorazowo zweryfikować z przełożonym czy dokument jest prawidłowy"
                ]} />
                <NumberedList items={[
                    "Sprawdź czy licencja jest aktualna",
                    "Gdy brak powyższych dokumentów – ZAKAZ WSPÓŁPRACY z wyjątkiem weryfikacji przewoźnika z przełożonym oraz otrzymania pisemnej zgody od przełożonego"
                ]} />
                 <Warning>
                    Gdy brak lub jakakolwiek niezgodność danych w powyższych dokumentach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA.
                </Warning>
            </SubSection>
        </InstructionSection>
        
        <InstructionSection title="Kontrola ubezpieczenia OCP/OCS oraz potwierdzenie płatności">
             <SubSection title="PRZEWOŹNIK KRAJOWY">
                <NumberedList items={[
                    "Gdy spedycja – Ubezpieczenie Odpowiedzialności Cywilnej Spedytora OCS nie obejmuje ono swoim zakresem uszkodzeń na towarze jest to ochrona ubezpieczeniowa za powstałe szkody, za które ponosi odpowiedzialność spedytor.",
                    "Gdy przewoźnik:",
                ]} />
                <SubList items={[
                    "Transport krajowy – Ubezpieczenie Odpowiedzialności Cywilnej Przewoźnika krajowe OCP-K (OCP-M nie zastępuj OCP-K)",
                    "Transport międzynarodowy – Ubezpieczanie Odpowiedzialności Cywilnej Przewoźnika międzynarodowe OCP-M"
                ]} />
                <NumberedList items={[
                    "Zweryfikuj zakres terytorialny polisy czy obejmuje ona kraj, do którego chcesz przewieźć towar",
                    "Zweryfikuj na jaką kwotę wykupiona jest polisa ubezpieczeniowa",
                    "Zweryfikuj zakres ubezpieczenia oraz wyłączeń z ubezpieczenia",
                    "Zweryfikuj potwierdzenie płatności za polisę ze szczególną uwagą na:",
                ]} />
                <SubList items={[
                    "Zgodność danych firmy na potwierdzeniu płatności oraz polisie",
                    "Zgodność numeru polisy z numerem zawartym w potwierdzeniu zapłaty",
                    "Zgodność kwoty płatności za polisę zawartej w dokumencie, a kwoty na potwierdzeniu płatności",
                    "Zgodność potwierdzenia płatności z harmonogramem rat w polisie – jeśli dotyczy"
                ]} />
                <Warning>
                    Gdy brak lub jakakolwiek niezgodność danych w powyższych dokumentach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA.
                </Warning>
            </SubSection>
            <SubSection title="PRZEWOŹNIK ZAGRANICZNY">
                <NumberedList items={[
                     "Gdy spedycja – Ubezpieczenie Odpowiedzialności Cywilnej Spedytora OCS bądź tożsame z dokumentem wydawanym w danym kraju",
                     "Gdy przewoźnik – Ubezpieczanie Odpowiedzialności Cywilnej Przewoźnika międzynarodowe OCP-M",
                     "Zweryfikuj zakres terytorialny polisy czy obejmuje ona kraj, do którego chcesz przewieźć towar",
                     "Zweryfikuj na jaką kwotę wykupiona jest polisa ubezpieczeniowa",
                     "Zweryfikuj zakres ubezpieczenia oraz włączeń z ubezpieczenia",
                     "Zweryfikuj potwierdzenie płatności za polisę ze szczególną uwagą na:",
                ]} />
                 <SubList items={[
                    "Zgodność danych firmy na potwierdzeniu płatności oraz polisie",
                    "Zgodność numeru polisy z numerem zawartym w potwierdzeniu zapłaty",
                    "Zgodność kwoty płatności za polisę zawartej w dokumencie, a kwoty na potwierdzeniu płatności",
                    "Zgodność potwierdzenia płatności z harmonogramem rat w polisie – jeśli dotyczy"
                ]} />
                <Warning>
                    Gdy brak lub jakakolwiek niezgodność danych w powyższych dokumentach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA.
                </Warning>
            </SubSection>
        </InstructionSection>

        <InstructionSection title="Weryfikacja wiarygodności">
            <SubSection title="Kontrola wiarygodności na giełdach transportowych">
                <NumberedList items={[
                    "Skontroluj historie współpracy:",
                ]} />
                 <SubList items={[
                    "Gdy firma jest zarejestrowana krócej niż 6 miesięcy na giełdzie – współpraca tylko po weryfikacji przełożonego i za jego pisemną zgodą",
                    "Gdy 10% negatywnych opinii - współpraca tylko po weryfikacji przełożonego i za jego pisemną zgodą",
                    "Gdy brak opinii – pozyskaj min. 3 referencje od dotychczasowych partnerów i nawiąż z nimi kontakt w celu potwierdzenia rzetelności przewoźnika",
                 ]}/>
                 <NumberedList items={[
                     "Zweryfikuj, czy przewoźnik współpracował już z naszą firmą i czy jest wpisany w bazie w SPEEDTRANSIE oraz czy współpraca z nim nie została zablokowana. Powód blokady wyjaśnia komunikat w kartotece",
                 ]} />
                 <Warning>
                    Jeśli coś wzbudza Twoje obawy lub pojawia się niezgodność w uzyskanych informacjach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA
                 </Warning>
            </SubSection>
            <SubSection title="Bezpośrednia kontrola wiarygodności">
                <NumberedList items={[
                    "Zweryfikuj czy adres mailowy przewoźnika ma taki sam adres jak domena strony internetowej. Zachowaj ostrożność gdy adresy zarejestrowane są na ogólnodostępnych bezpłatnych domenach",
                    "Zweryfikuj czy strona internetowa przewoźnika (jeśli posiada) nie wzbudza podejrzeń a dane na niej zawarte pokrywają się z prawdą w szczególności:",
                ]} />
                 <SubList items={[
                    "Czy kontakt do osoby, z którą prowadzisz rozmowę jest dostępny również na stronie",
                    "Czy numer telefonu osoby, z którym prowadzisz rozmowę pokrywa się z tym dostępnym na stronie",
                    "Czy adres mailowy osoby, z którą prowadzisz rozmowę jest zarejestrowany w tej samej domenie co adresy ze strony www",
                    "Czy dane w stopce mailowej osoby, z którą prowadzisz rozmowę pokrywają się z tymi na stronie www",
                 ]} />
                 <NumberedList items={[
                    "Zachowaj ostrożność, gdy klient nie ma strony internetowej",
                    "Nawiąż kontakt z firmą:",
                 ]} />
                  <SubList items={[
                    "Zadzwoń pod numer telefonu dostępny na stronie www klienta i zapytaj o osobę, z którą ustalasz szczegóły transakcji",
                    "Gdy nie ma kontaktu do nikogo innego poza osobą, z którą rozmawiasz współpraca tylko za pisemną zgodą przełożonego",
                  ]} />
                  <NumberedList items={[
                    "Wymagaj potwierdzenia wysłania zlecenia do realizacji od klienta na piśmie",
                    "Jeżeli coś wzbudza twoją wątpliwość zastosuj działania z pozycji Zebranie opinii i referencji jako działania uzupełniające",
                  ]} />
                  <Warning>
                    Jeśli coś wzbudza Twoje obawy lub pojawia się niezgodność w uzyskanych informacjach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA
                  </Warning>
            </SubSection>
            <SubSection title="Zebranie opinii i referencji jako działania uzupełniające">
                <NumberedList items={[
                    "Zweryfikuj, jeśli masz taką możliwość, kiedy została utworzona domena oraz do kogo należy za pośrednictwem serwis WHO.IS",
                    "Pobierz referencje ze strony internetowej klienta",
                    "Zawnioskuj o referencje u klienta, jeśli nie posiada żadnych opinii na stronie www czy Social Mediach",
                    "Gdy natkniesz się na opinie negatywne w wyszukiwarce Google, na Social Mediach masz ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego",
                    "Zweryfikuj czy dane na stronie www klienta w zakładce Polityka Prywatności zgadzają się z resztą danych dostępnych na stronie",
                    "Pozyskaj informację o kliencie z Internetu:",
                ]} />
                 <SubList items={[
                    "Sprawdź opinie o kliencie w Google",
                    "Sprawdź adres klienta w Google Maps",
                    "Sprawdź osobę, z którą prowadzisz rozmowę na Social Mediach (w szczególności Linked in)",
                 ]} />
                 <Warning>
                    Jeśli coś wzbudza Twoje obawy lub pojawia się niezgodność w uzyskanych informacjach – ZAKAZ WSPÓŁPRACY z wyjątkiem otrzymania pisemnej zgody od przełożonego. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA
                 </Warning>
            </SubSection>
            <SubSection title="Sygnały ostrzegawcze nakazujące wzmożoną ostrożność">
                <NumberedList items={[
                    "Niezgodna domena www z adresem mailowym osoby kontaktującej się z nami",
                    "Brak strony firmowej www albo strona nie działa",
                    "Adres mailowy założony na domenach ogólnodostępnych np. yahoo, wp, gmail, onet, net, cloud itp.",
                    "Brak danych firmy w stopce mailowej klienta",
                    "Wiadomość od zupełnie nowego klienta proponująca dość szybką transakcję",
                    "Nadawca maila sam zainicjował korespondencję wysyłając zapytanie",
                    "Szybko podjęta decyzja zakupowa bez negocjacji ceny a za tym idzie zaakceptowane wysokie stawki",
                    "Faktura na inna firmę niż zlecenie. Pozyskaj pisemną zgodę od firmy, na którą będzie wystawiona faktura w sytuacji, gdy klient prosi o wystawienie faktury na inną firmę niż zlecenie",
                    "Pozytywne opinie w Internecie wyglądające na wystawione przez tzw. Boty",
                ]} />
                <Warning>
                    Nie ignoruj sygnałów ostrzegawczych. Ryzykując ponosisz odpowiedzialność finansową w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA
                </Warning>
            </SubSection>
            <SubSection title="Zakazane działania">
                <NumberedList items={[
                    "Wysłanie pojazdu na załadunek bez należytej weryfikacji klienta wg. powyższych wytycznych",
                    "Wysłanie pojazdu na załadunek bez zlecenia od załadowcy",
                    "Zakaz przekierowania dostawy bez pisemnych wytycznych od klienta",
                ]} />
                <Warning>
                    Łamiąc powyższe zakazy ryzykujesz poniesienie odpowiedzialności w myśl zapisów na stronie NIEDBALSTWO CZY WINA UMYŚLNA
                </Warning>
            </SubSection>
        </InstructionSection>
      </CardContent>
    </Card>
  );
}
