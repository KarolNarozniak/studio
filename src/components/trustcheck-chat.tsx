
"use client";

import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, AlertTriangle, PanelRightClose, PanelRightOpen } from 'lucide-react';
import Image from 'next/image';

import type { TrustCheckResult, ChatMessage } from '@/lib/types';
import { chatAboutResults } from '@/app/actions';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const formSchema = z.object({
  message: z.string().min(1, { message: 'Wiadomość nie może być pusta.' }),
});

const formatAnalysisDataForPrompt = (analysisResults: TrustCheckResult): string => {
    const { analysis, summary } = analysisResults;
    const isEmlAnalysis = analysis.query.endsWith('.eml');
    
    const senderInfo = isEmlAnalysis ? `- Email nadawcy: ${analysis.whoisData.domain}` : '';
    
    const contentInfo = analysis.contentAnalysis 
        ? `- Analiza treści e-maila: Podejrzana: ${analysis.contentAnalysis.isSuspicious}. Powód: ${analysis.contentAnalysis.suspicionReason}\n- Wyodrębniona treść e-maila: ${analysis.contentAnalysis.extractedBody}` 
        : '- Analiza treści e-maila: Nie dotyczy';

    // Include raw data if available
    const rawDataInfo = analysis.rawApiResponses 
        ? `- Surowe dane API: ${JSON.stringify(analysis.rawApiResponses)}` 
        : '- Surowe dane API: Brak';

    const categoryInfo = `- Kategoryzacja strony: Strona odpowiada: ${analysis.websiteCategorization.websiteResponded}. Kategorie: ${analysis.websiteCategorization.categories.map(c => c.name).join(', ') || 'Brak'}.`;


    return `
- Zapytanie: ${analysis.query}
${senderInfo}
- Ogólne podsumowanie: ${summary.summary}
- Reputacja domeny: Ocena: ${analysis.domainReputation.score}/100 od ${analysis.domainReputation.provider}.
${categoryInfo}
- Dane WHOIS: Domena utworzona ${analysis.whoisData.creationDate} i wygasa ${analysis.whoisData.expiryDate}. Rejestrator: ${analysis.whoisData.registrar}. Właściciel: ${analysis.whoisData.owner || 'Brak danych'}.
- Rekordy DNS: MX: ${analysis.dnsRecords.mx}, SPF: ${analysis.dnsRecords.spf}, DKIM: ${analysis.dnsRecords.dkim}, DMARC: ${analysis.dnsRecords.dmarc}.
- Status na czarnej liście: Na liście: ${analysis.blacklistStatus.isListed}. Źródła: ${analysis.blacklistStatus.sources.join(', ') || 'Brak'}.
- Analiza zagrożeń: Znane zagrożenie: ${analysis.threatIntelligence.isKnownThreat}. Typy zagrożeń: ${analysis.threatIntelligence.threatTypes.join(", ") || "Brak"}.
- Dane historyczne: Zmiany właściciela: ${analysis.historicalData.changes}. Ostatnia zmiana: ${analysis.historicalData.lastChangeDate}.
- Sprawdzenie pod kątem typosquattingu: Potencjalny typosquatting: ${analysis.typosquattingCheck.isPotentialTyposquatting}. Podejrzewana oryginalna domena: ${analysis.typosquattingCheck.suspectedOriginalDomain}. Powód: ${analysis.typosquattingCheck.reason}
- Weryfikacja e-maila: ${analysis.isEmail && analysis.emailVerification ? `Dostarczalny: ${analysis.emailVerification.isDeliverable}, Jednorazowy: ${analysis.emailVerification.isDisposable}, Catch-All: ${analysis.emailVerification.isCatchAll}.` : 'Nie dotyczy'}
${contentInfo}
${rawDataInfo}
  `.trim();
}

export function TrustCheckChat({ result }: { result: TrustCheckResult }) {
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const analysisData = formatAnalysisDataForPrompt(result);
    const systemPrompt = `Jesteś asystentem AI dla aplikacji TrustCheck. Twoim zadaniem jest odpowiadanie na pytania użytkowników na podstawie raportu z analizy bezpieczeństwa dla e-maila lub domeny. Używaj WYŁĄCZNIE informacji zawartych w raporcie. Jeśli informacja nie znajduje się w raporcie, stwierdź, że nie posiadasz tej informacji.
Gdy analizowany jest plik .eml, pole 'Zapytanie' to nazwa pliku, a pole 'Email nadawcy' to wyodrębniony adres nadawcy.
Możesz również zostać poproszony o informacje z 'Surowych danych API'. W takim przypadku przedstaw dane w czytelny sposób.
Odpowiadaj w języku, w którym pyta użytkownik. Jeśli język nie jest jasny lub nie jest to angielski ani polski, domyślnie użyj języka polskiego.
Oto pełny raport analizy (Here is the full analysis report):
---
${analysisData}
---`;
    
    setHistory([{ role: 'system', parts: [{ text: systemPrompt }] }]);
    setDisplayMessages([
      {
        role: 'assistant',
        content: `Cześć! Jestem Twoim asystentem. Przeanalizowałem raport. O co chciałbyś zapytać?`
      }
    ]);
    setIsCollapsed(false); // Open chat when new results come in
  }, [result]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [displayMessages]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const userMessage: DisplayMessage = { role: 'user', content: values.message };
    setDisplayMessages((prev) => [...prev, userMessage]);
    form.reset();

    try {
      const response = await chatAboutResults(history, values.message);
      if ('error' in response) {
        throw new Error(response.error);
      }
      const assistantMessage: DisplayMessage = { role: 'assistant', content: response.reply };
      setDisplayMessages((prev) => [...prev, assistantMessage]);
      
      setHistory(prev => [...prev, 
        { role: 'user', parts: [{ text: values.message }] },
        { role: 'model', parts: [{ text: response.reply }] }
      ]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
       const assistantErrorMessage: DisplayMessage = {
        role: 'assistant',
        content: `Przepraszamy, wystąpił błąd: ${errorMessage}`,
        isError: true,
      };
      setDisplayMessages((prev) => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "h-full bg-card text-card-foreground flex flex-col transition-all duration-300 ease-in-out border-l-2 border-primary/50",
        isCollapsed ? "w-12" : "w-96"
      )}>
        <div className="flex items-center justify-between p-2 border-b border-primary/20">
          {!isCollapsed && <h3 className="font-semibold text-lg ml-2">Asystent AI</h3>}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="text-foreground hover:bg-muted">
                {isCollapsed ? <PanelRightOpen /> : <PanelRightClose />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isCollapsed ? "Otwórz czat" : "Zamknij czat"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute inset-0 z-0 opacity-5 p-8 pointer-events-none">
                <Image 
                  src="/nglt-logo-background.png"
                  alt="NGLT Logo background"
                  fill
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-contain"
                  priority
                />
            </div>
            <ScrollArea className="flex-1 p-4 z-10" ref={scrollAreaRef}>
              <div className="space-y-4">
                {displayMessages.map((message, index) => (
                  <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex-shrink-0">
                         <div className={cn("flex items-center justify-center w-full h-full", message.isError && 'bg-destructive')}>
                          {message.isError ? <AlertTriangle size={20} className="text-destructive-foreground" /> : <Bot size={20} className="text-primary"/>}
                         </div>
                      </div>
                    )}
                    <div className={cn('max-w-sm p-3 rounded-lg', message.role === 'user' ? 'bg-primary text-primary-foreground' : (message.isError ? 'bg-destructive/20 text-destructive' : 'bg-muted'))}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                       <Image src="/chat-avatar-dog.png" alt="Chat avatar" width={40} height={40} className="rounded-full"/>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                      <div className="w-8 h-8 bg-card rounded-full flex-shrink-0">
                        <div className="flex items-center justify-center w-full h-full">
                           <Bot size={20} className="text-primary"/>
                        </div>
                      </div>
                      <div className="max-w-sm p-3 rounded-lg bg-muted">
                        <Skeleton className="w-20 h-4 bg-muted-foreground/30" />
                      </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-primary/20 z-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Zadaj pytanie..."
                            {...field}
                            disabled={isLoading}
                            autoComplete="off"
                            className="bg-background border-primary/50 text-base"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} size="icon" className="bg-primary hover:bg-primary/90">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
