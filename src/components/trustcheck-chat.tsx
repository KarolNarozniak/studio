"use client";

import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form'; // Corrected: import useForm from react-hook-form
import { zodResolver } from '@hookform/resolvers/zod'; // Corrected: import zodResolver
import { Bot, Loader2, Send, User, AlertTriangle } from 'lucide-react';

import type { TrustCheckResult, ChatMessage } from '@/lib/types'; // Using shared ChatMessage type
import { chatAboutResults } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

// Removed local ChatMessage interface, it's now imported from '@/lib/types'

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const formSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

const formatAnalysisDataForPrompt = (analysisResults: TrustCheckResult): string => {
    const { analysis, summary } = analysisResults;
    return `
- Query: ${analysis.query}
- Overall Summary: ${summary.summary}
- Domain Reputation: Score: ${analysis.domainReputation.score}/100 from ${analysis.domainReputation.provider}.
- WHOIS Data: Domain created on ${analysis.whoisData.creationDate} and expires on ${analysis.whoisData.expiryDate}. Registrar: ${analysis.whoisData.registrar}. Owner: ${analysis.whoisData.owner || 'N/A'}.
- DNS Records: MX: ${analysis.dnsRecords.mx}, SPF: ${analysis.dnsRecords.spf}, DKIM: ${analysis.dnsRecords.dkim}, DMARC: ${analysis.dnsRecords.dmarc}.
- Blacklist Status: Is Listed: ${analysis.blacklistStatus.isListed}. Sources: ${analysis.blacklistStatus.sources.join(', ') || 'None'}.
- Threat Intelligence: Is Known Threat: ${analysis.threatIntelligence.isKnownThreat}. Threat Types: ${analysis.threatIntelligence.threatTypes.join(", ") || "None"}.
- Historical Data: Ownership Changes: ${analysis.historicalData.changes}. Last Change: ${analysis.historicalData.lastChangeDate}.
- Typosquatting Check: Is Potential Typosquatting: ${analysis.typosquattingCheck.isPotentialTyposquatting}. Suspected Original: ${analysis.typosquattingCheck.suspectedOriginalDomain}. Reason: ${analysis.typosquattingCheck.reason}
- Email Verification: ${analysis.isEmail && analysis.emailVerification ? `Deliverable: ${analysis.emailVerification.isDeliverable}, Disposable: ${analysis.emailVerification.isDisposable}, Catch-All: ${analysis.emailVerification.isCatchAll}.` : 'N/A'}
  `.trim();
}

export function TrustCheckChat({ result }: { result: TrustCheckResult }) {
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]); // Using imported ChatMessage type
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const analysisData = formatAnalysisDataForPrompt(result);
    const systemPrompt = `You are an AI assistant for the TrustCheck application. Your task is to answer user questions based on the security analysis report for an email or domain. Use ONLY the information provided in the report. If the information is not in the report, state that you do not have that information.
Respond in the language the user is asking in. If the language is not clear or it's not English or Polish, default to English.
Oto pełny raport analizy (Here is the full analysis report):
---
${analysisData}
---`;
    
    setHistory([{ role: 'system', parts: [{ text: systemPrompt }] }]);
    setDisplayMessages([]);
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
        content: `Sorry, an error occurred: ${errorMessage}`,
        isError: true,
      };
      setDisplayMessages((prev) => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          Ask a question about the results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-1 p-4 border rounded-lg" ref={scrollAreaRef}>
            <div className="space-y-4">
              {displayMessages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Ask me anything about the report, for example: "Why is the domain reputation score low?"
                </div>
              ) : (
                displayMessages.map((message, index) => (
                  <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={cn(message.isError && 'bg-destructive')}>
                          {message.isError ? <AlertTriangle size={20} className="text-destructive-foreground" /> : <Bot size={20}/>}
                          </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn('max-w-sm p-3 rounded-lg', message.role === 'user' ? 'bg-primary text-primary-foreground' : (message.isError ? 'bg-destructive/20 text-destructive' : 'bg-muted'))}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback><User size={20}/></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
               {isLoading && !displayMessages.some(m => m.isError) && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="max-w-sm p-3 rounded-lg bg-muted">
                      <Skeleton className="w-20 h-4" />
                    </div>
                 </div>
                )}
            </div>
          </ScrollArea>
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          placeholder="Type your message..."
                          {...field}
                          disabled={isLoading}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} size="icon">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}