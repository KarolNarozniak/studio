
"use client";

import type { TrustCheckResult, WhoisData, DnsRecords, BlacklistStatus, ThreatIntelligenceReport, HistoricalData, EmailVerification, DomainReputation, TyposquattingCheck, AnalysisResults, RawApiResponses, WebsiteCategorization } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Dna,
  FileClock,
  FileText,
  Gauge,
  HelpCircle,
  List,
  MailCheck,
  ScanSearch,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

type TrustCheckResultsProps = {
  result: TrustCheckResult;
};

const getRecommendationInfo = (recommendation: "Fake" | "Real") => {
  switch (recommendation) {
    case "Real":
      return {
        title: "Prawdopodobnie Prawdziwy",
        Icon: ShieldCheck,
        color: "text-green-500",
        progressColor: "bg-green-500",
      };
    case "Fake":
      return {
        title: "Prawdopodobnie Fałszywy",
        Icon: ShieldAlert,
        color: "text-destructive",
        progressColor: "bg-destructive",
      };
    default:
      return {
        title: "Niepewny",
        Icon: ShieldQuestion,
        color: "text-yellow-500",
        progressColor: "bg-yellow-500",
      };
  }
};

const SectionIcon = ({ icon }: { icon: React.ElementType }) => {
  const Icon = icon;
  return <Icon className="h-5 w-5 text-primary mr-3" />;
};

const DetailItem = ({ label, value, tooltip, valueClassName }: { label: string; value: React.ReactNode; tooltip?: string, valueClassName?: string }) => (
  <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-b-0">
    <div className="flex items-center flex-shrink-0 mr-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div className={cn("text-sm font-medium text-foreground text-right", valueClassName)}>{value}</div>
  </div>
);

const BooleanBadge = ({ value }: { value: boolean }) => (
    value ? 
    <Badge variant="default" className="bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Tak
    </Badge> : 
    <Badge variant="destructive" className="bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30">
        <AlertCircle className="mr-1 h-3 w-3" /> Nie
    </Badge>
);

const RawDataViewer = ({ data, buttonText = "Pokaż surowe dane" } : { data: any, buttonText?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!data) return null;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mt-4">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    {buttonText}
                    <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", isOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <pre className="mt-2 text-xs whitespace-pre-wrap font-mono bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </CollapsibleContent>
        </Collapsible>
    );
};

export function TrustCheckResults({ result }: TrustCheckResultsProps) {
  const { analysis, summary } = result;
  const { recommendation, confidenceScore, summary: aiSummary } = summary;
  const { title, Icon, color, progressColor } = getRecommendationInfo(recommendation);
  const confidence = Math.round(confidenceScore * 100);
  const isEmlFile = analysis.query.endsWith('.eml');

  const resultDescription = isEmlFile 
    ? `Na podstawie naszej analizy pliku '${analysis.query}' od ${analysis.whoisData.domain}, to jest nasza rekomendacja.`
    : `Na podstawie naszej analizy, to jest nasza rekomendacja dla '${analysis.query}'.`

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Icon className={`w-12 h-12 ${color}`} />
            <div>
              <CardTitle className={`text-3xl ${color}`}>{title}</CardTitle>
              <CardDescription className="text-base">
                {resultDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">Wskaźnik zaufania</span>
              <span className={`text-sm font-bold ${color}`}>{confidence}%</span>
            </div>
            <Progress value={confidence} indicatorClassName={progressColor} />
          </div>
          <p className="text-foreground/90 text-justify bg-muted p-4 rounded-lg">{aiSummary}</p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        
        {analysis.contentAnalysis && (
            <AccordionItem value="item-content-analysis">
                <AccordionTrigger className="text-lg font-semibold">
                    <SectionIcon icon={FileText} /> Analiza treści e-mail
                </AccordionTrigger>
                <AccordionContent>
                    <ContentAnalysisSection data={analysis.contentAnalysis} />
                </AccordionContent>
            </AccordionItem>
        )}

        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={Gauge} /> Reputacja domeny
          </AccordionTrigger>
          <AccordionContent>
            <DomainReputationSection data={analysis.domainReputation} rawData={analysis.rawApiResponses?.reputation} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-categorization">
            <AccordionTrigger className="text-lg font-semibold">
                <SectionIcon icon={BookMarked} /> Kategoryzacja strony
            </AccordionTrigger>
            <AccordionContent>
                <WebsiteCategorizationSection data={analysis.websiteCategorization} rawData={analysis.rawApiResponses?.websiteCategorization} />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-typosquatting">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={ScanSearch} /> Weryfikacja pod kątem typosquattingu
          </AccordionTrigger>
          <AccordionContent>
            <TyposquattingSection data={analysis.typosquattingCheck} rawData={analysis.rawApiResponses?.typosquatting} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={User} /> Informacje WHOIS
          </AccordionTrigger>
          <AccordionContent>
            <WhoisSection data={analysis.whoisData} rawData={analysis.rawApiResponses?.whois} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={Server} /> Rekordy DNS
          </AccordionTrigger>
          <AccordionContent>
             <DnsSection data={analysis.dnsRecords} rawData={analysis.rawApiResponses?.dns} />
          </AccordionContent>
        </AccordionItem>
        
        {analysis.isEmail && analysis.emailVerification && (
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-semibold">
              <SectionIcon icon={MailCheck} /> Weryfikacja email
            </AccordionTrigger>
            <AccordionContent>
              <EmailVerificationSection data={analysis.emailVerification} rawData={analysis.rawApiResponses?.email} />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={List} /> Status na czarnej liście
          </AccordionTrigger>
          <AccordionContent>
             <BlacklistSection data={analysis.blacklistStatus} rawData={analysis.rawApiResponses?.threat} />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-6">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={Dna} /> Analiza zagrożeń
          </AccordionTrigger>
          <AccordionContent>
             <ThreatIntelligenceSection data={analysis.threatIntelligence} rawData={analysis.rawApiResponses?.threat} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={FileClock} /> Dane archiwalne
          </AccordionTrigger>
          <AccordionContent>
             <HistoricalDataSection data={analysis.historicalData} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const ContentAnalysisSection = ({ data }: { data: NonNullable<AnalysisResults['contentAnalysis']> }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4 space-y-2">
            <DetailItem label="Treść podejrzana" value={<BooleanBadge value={data.isSuspicious} />} />
            <DetailItem label="Powód" value={data.suspicionReason} valueClassName="text-justify" />
             <div className="pt-2">
                <span className="text-sm text-muted-foreground">Wyodrębniona treść</span>
                <pre className="mt-1 text-xs whitespace-pre-wrap font-mono bg-muted p-2 rounded-md max-h-96 overflow-y-auto">
                    {data.extractedBody}
                </pre>
            </div>
        </CardContent>
    </Card>
);

const DomainReputationSection = ({ data, rawData }: { data: DomainReputation, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Dostawca" value={data.provider} />
            <DetailItem label="Ocena" value={`${data.score} / 100`} />
            <RawDataViewer data={rawData} />
        </CardContent>
    </Card>
);

const WebsiteCategorizationSection = ({ data, rawData }: { data: WebsiteCategorization, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Strona odpowiada" value={<BooleanBadge value={data.websiteResponded} />} tooltip="Czy strona była aktywna i odpowiadała podczas skanowania." />
            <DetailItem 
                label="Kategorie" 
                value={data.categories.length > 0 
                    ? data.categories.map(cat => `${cat.name} (${(cat.confidence * 100).toFixed(0)}%)`).join(', ') 
                    : 'Brak'}
            />
            <RawDataViewer data={rawData} />
        </CardContent>
    </Card>
);

const TyposquattingSection = ({ data, rawData }: { data: TyposquattingCheck, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Podejrzenie typosquattingu" value={<BooleanBadge value={data.isPotentialTyposquatting} />} tooltip="Sprawdza, czy nazwa domeny jest celowo podobna do popularnej domeny w celu oszukania użytkowników." />
            <DetailItem label="Podejrzana domena oryginalna" value={data.suspectedOriginalDomain} />
            <DetailItem label="Powód" value={data.reason} valueClassName="text-justify"/>
            <RawDataViewer data={rawData} buttonText="Pokaż dane z AI" />
        </CardContent>
    </Card>
);

const WhoisSection = ({ data, rawData }: { data: WhoisData, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Domena" value={data.domain} />
            <DetailItem label="Rejestrator" value={data.registrar} />
            <DetailItem label="Data utworzenia" value={data.creationDate} />
            <DetailItem label="Data wygaśnięcia" value={data.expiryDate} />
            <DetailItem label="Właściciel" value={data.owner || 'Brak danych'} />
            <RawDataViewer data={rawData} />
        </CardContent>
    </Card>
);

const DnsSection = ({ data, rawData }: { data: DnsRecords, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Rekord MX" value={<BooleanBadge value={data.mx} />} tooltip="Rekordy Mail Exchange (MX) kierują pocztę e-mail na serwer pocztowy." />
            <DetailItem label="Rekord SPF" value={<BooleanBadge value={data.spf} />} tooltip="Sender Policy Framework (SPF) zapobiega fałszowaniu adresów nadawców." />
            <DetailItem label="Rekord DKIM" value={<BooleanBadge value={data.dkim} />} tooltip="DomainKeys Identified Mail (DKIM) zapewnia integralność wiadomości." />
            <DetailItem label="Rekord DMARC" value={<BooleanBadge value={data.dmarc} />} tooltip="Domain-based Message Authentication, Reporting, and Conformance (DMARC) dostosowuje SPF i DKIM." />
            <RawDataViewer data={rawData} />
        </CardContent>
    </Card>
);

const EmailVerificationSection = ({ data, rawData }: { data: EmailVerification, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Dostarczalny" value={<BooleanBadge value={data.isDeliverable} />} tooltip="Czy adres e-mail może odbierać pocztę." />
            <DetailItem label="Jednorazowy" value={<BooleanBadge value={data.isDisposable} />} tooltip="Czy e-mail pochodzi od dostawcy tymczasowych adresów e-mail." />
            <DetailItem label="Catch-All" value={<BooleanBadge value={data.isCatchAll} />} tooltip="Czy serwer akceptuje wszystkie e-maile do domeny." />
            <RawDataViewer data={rawData} />
        </CardContent>
    </Card>
);

const BlacklistSection = ({ data, rawData }: { data: BlacklistStatus, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Umieszczony na czarnej liście" value={<BooleanBadge value={data.isListed} />} />
            <DetailItem label="Źródła czarnej listy" value={data.sources.length > 0 ? data.sources.join(', ') : 'Brak'} />
            <RawDataViewer data={rawData} />
        </CardContent>
    </Card>
);

const ThreatIntelligenceSection = ({ data, rawData }: { data: ThreatIntelligenceReport, rawData: any }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Znane zagrożenie" value={<BooleanBadge value={data.isKnownThreat} />} />
            <DetailItem label="Typy zagrożeń" value={data.threatTypes.length > 0 ? data.threatTypes.join(', ') : 'Brak'} />
            <RawDataViewer data={rawData} />
        </CardContent>
    </Card>
);

const HistoricalDataSection = ({ data }: { data: HistoricalData }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Zmiany właściciela" value={data.changes} />
            <DetailItem label="Data ostatniej zmiany" value={data.lastChangeDate} />
        </CardContent>
    </Card>
);

    
