"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { TrustCheckResult } from "@/lib/types";
import { performTrustCheck, runChatDiagnostics } from "@/app/actions";
import FakeOrNotLogo from "@/components/fakeornot-logo";
import { TrustCheckForm } from "@/components/trustcheck-form";
import { TrustCheckResults } from "@/components/trustcheck-results";
import { TrustCheckChat } from "@/components/trustcheck-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<TrustCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const handleCheck = async (formData: FormData) => {
    setIsLoading(true);
    setResult(null);
    setTestLogs([]);
    try {
      const response = await performTrustCheck(formData);
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTests = async () => {
      if (!result) return;
      setIsTesting(true);
      setTestLogs([]);
      try {
          const response = await runChatDiagnostics(result, 'test');
          if (response.error) {
              setTestLogs([`An error occurred while running tests: ${response.error}`]);
          } else {
              setTestLogs(response.logs);
          }
      } catch (error) {
           const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred.";
           setTestLogs([`An unexpected error occurred: ${errorMessage}`]);
      } finally {
          setIsTesting(false);
      }
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <header className="flex flex-col items-center text-center mb-8">
          <FakeOrNotLogo className="w-20 h-20 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            FakeOrNot
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Ultimate tool against Phishing. Enter an email or domain to analyze its trustworthiness.
          </p>
        </header>

        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <TrustCheckForm onSubmit={handleCheck} isLoading={isLoading} />
          </CardContent>
        </Card>
        
        {isLoading && <LoadingSkeleton />}
        {result && (
            <div className="space-y-8">
                <TrustCheckResults result={result} />
                <TrustCheckChat result={result} />
            </div>
        )}
        
        {result && (
          <Card className="mt-8">
              <CardHeader>
                  <CardTitle>Chat Diagnostics</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground mb-4">Click the button below to run a series of tests on the chat functionality and see verbose logs.</p>
                  <Button onClick={handleRunTests} disabled={isTesting}>
                      {isTesting ? "Running..." : "Run Diagnostics"}
                  </Button>
                  {testLogs.length > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
                          <h3 className="font-bold mb-2 flex items-center"><Terminal className="mr-2 h-4 w-4" /> Test Logs</h3>
                          <pre className="whitespace-pre-wrap">
                              {testLogs.join('\n')}
                          </pre>
                      </div>
                  )}
              </CardContent>
          </Card>
        )}

      </main>

      <footer className="w-full max-w-4xl mx-auto text-center mt-auto pt-8">
        <p className="text-sm text-muted-foreground">
          Powered by Next.js and Google Genkit.
        </p>
      </footer>
    </div>
  );
}

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </CardContent>
  </Card>
);
