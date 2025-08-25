"use client";

import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, AlertTriangle } from 'lucide-react';

import type { TrustCheckResult } from '@/lib/types';
import { chatAboutResults } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const formSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

export function TrustCheckChat({ result }: { result: TrustCheckResult }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: values.message };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    try {
      const response = await chatAboutResults(result, values.message);
      if (response.error) {
        throw new Error(response.error);
      }
      const assistantMessage: Message = { role: 'assistant', content: response.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
       const assistantErrorMessage: Message = {
        role: 'assistant',
        content: `Sorry, an error occurred: ${errorMessage}`,
        isError: true,
      };
      setMessages((prev) => [...prev, assistantErrorMessage]);
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
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Ask me anything about the report, for example: "Why is the domain reputation score low?"
                </div>
              ) : (
                messages.map((message, index) => (
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
               {isLoading && !messages.some(m => m.isError) && (
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
