
"use client";

import type { TrustCheckResult, WhoisData, DnsRecords, BlacklistStatus, ThreatIntelligenceReport, HistoricalData, EmailVerification, DomainReputation, TyposquattingCheck, AnalysisResults } from "@/lib/types";
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
  CheckCircle2,
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
import React from "react";

type TrustCheckResultsProps = {
  result: TrustCheckResult;
};

const getRecommendationInfo = (recommendation: "Fake" | "Real") => {
  switch (recommendation) {
    case "Real":
      return {
        title: "Likely Real",
        Icon: ShieldCheck,
        color: "text-green-500",
        progressColor: "bg-green-500",
      };
    case "Fake":
      return {
        title: "Likely Fake",
        Icon: ShieldAlert,
        color: "text-destructive",
        progressColor: "bg-destructive",
      };
    default:
      return {
        title: "Uncertain",
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

const DetailItem = ({ label, value, tooltip }: { label: string; value: React.ReactNode; tooltip?: string }) => (
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
    <div className="text-sm font-medium text-foreground text-right">{value}</div>
  </div>
);

const BooleanBadge = ({ value }: { value: boolean }) => (
    value ? 
    <Badge variant="default" className="bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Yes
    </Badge> : 
    <Badge variant="destructive" className="bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30">
        <AlertCircle className="mr-1 h-3 w-3" /> No
    </Badge>
);

export function TrustCheckResults({ result }: TrustCheckResultsProps) {
  const { analysis, summary } = result;
  const { recommendation, confidenceScore, summary: aiSummary } = summary;
  const { title, Icon, color, progressColor } = getRecommendationInfo(recommendation);
  const confidence = Math.round(confidenceScore * 100);
  const isEmlFile = analysis.query.endsWith('.eml');
  const displayQuery = isEmlFile ? `${analysis.query} from ${analysis.whoisData.domain}` : analysis.query;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Icon className={`w-12 h-12 ${color}`} />
            <div>
              <CardTitle className={`text-3xl ${color}`}>{title}</CardTitle>
              <CardDescription className="text-base">
                Based on our analysis, this is our recommendation for '{displayQuery}'.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">Confidence Score</span>
              <span className={`text-sm font-bold ${color}`}>{confidence}%</span>
            </div>
            <Progress value={confidence} indicatorClassName={progressColor} />
          </div>
          <p className="text-foreground/90 text-center bg-muted p-4 rounded-lg">{aiSummary}</p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        
        {analysis.contentAnalysis && (
            <AccordionItem value="item-content-analysis">
                <AccordionTrigger className="text-lg font-semibold">
                    <SectionIcon icon={FileText} /> E-mail Content Analysis
                </AccordionTrigger>
                <AccordionContent>
                    <ContentAnalysisSection data={analysis.contentAnalysis} />
                </AccordionContent>
            </AccordionItem>
        )}

        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={Gauge} /> Domain Reputation
          </AccordionTrigger>
          <AccordionContent>
            <DomainReputationSection data={analysis.domainReputation} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-typosquatting">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={ScanSearch} /> Typosquatting Check
          </AccordionTrigger>
          <AccordionContent>
            <TyposquattingSection data={analysis.typosquattingCheck} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={User} /> WHOIS Information
          </AccordionTrigger>
          <AccordionContent>
            <WhoisSection data={analysis.whoisData} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={Server} /> DNS Records
          </AccordionTrigger>
          <AccordionContent>
             <DnsSection data={analysis.dnsRecords} />
          </AccordionContent>
        </AccordionItem>
        
        {analysis.isEmail && analysis.emailVerification && (
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-semibold">
              <SectionIcon icon={MailCheck} /> Email Verification
            </AccordionTrigger>
            <AccordionContent>
              <EmailVerificationSection data={analysis.emailVerification} />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={List} /> Blacklist Status
          </AccordionTrigger>
          <AccordionContent>
             <BlacklistSection data={analysis.blacklistStatus} />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-6">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={Dna} /> Threat Intelligence
          </AccordionTrigger>
          <AccordionContent>
             <ThreatIntelligenceSection data={analysis.threatIntelligence} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger className="text-lg font-semibold">
            <SectionIcon icon={FileClock} /> Historical Data
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
            <DetailItem label="Content is Suspicious" value={<BooleanBadge value={data.isSuspicious} />} />
            <DetailItem label="Reason" value={data.suspicionReason} />
             <div className="pt-2">
                <span className="text-sm text-muted-foreground">Extracted Body (first 500 chars)</span>
                <pre className="mt-1 text-xs whitespace-pre-wrap font-mono bg-muted p-2 rounded-md max-h-48 overflow-y-auto">
                    {data.extractedBody}
                </pre>
            </div>
        </CardContent>
    </Card>
);

const DomainReputationSection = ({ data }: { data: DomainReputation }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Provider" value={data.provider} />
            <DetailItem label="Score" value={`${data.score} / 100`} />
        </CardContent>
    </Card>
);

const TyposquattingSection = ({ data }: { data: TyposquattingCheck }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Potential Typosquatting" value={<BooleanBadge value={data.isPotentialTyposquatting} />} tooltip="Checks if the domain name is intentionally similar to a popular domain to deceive users." />
            <DetailItem label="Suspected Original" value={data.suspectedOriginalDomain} />
            <DetailItem label="Reason" value={data.reason} />
        </CardContent>
    </Card>
);

const WhoisSection = ({ data }: { data: WhoisData }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Domain" value={data.domain} />
            <DetailItem label="Registrar" value={data.registrar} />
            <DetailItem label="Creation Date" value={data.creationDate} />
            <DetailItem label="Expiry Date" value={data.expiryDate} />
            <DetailItem label="Owner" value={data.owner} />
        </CardContent>
    </Card>
);

const DnsSection = ({ data }: { data: DnsRecords }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="MX Record" value={<BooleanBadge value={data.mx} />} tooltip="Mail Exchange records direct email to a mail server." />
            <DetailItem label="SPF Record" value={<BooleanBadge value={data.spf} />} tooltip="Sender Policy Framework prevents sender address forgery." />
            <DetailItem label="DKIM Record" value={<BooleanBadge value={data.dkim} />} tooltip="DomainKeys Identified Mail ensures message integrity." />
            <DetailItem label="DMARC Record" value={<BooleanBadge value={data.dmarc} />} tooltip="Domain-based Message Authentication, Reporting, and Conformance aligns SPF and DKIM." />
        </CardContent>
    </Card>
);

const EmailVerificationSection = ({ data }: { data: EmailVerification }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Deliverable" value={<BooleanBadge value={data.isDeliverable} />} tooltip="Whether the email address can receive mail." />
            <DetailItem label="Disposable" value={<BooleanBadge value={data.isDisposable} />} tooltip="Whether the email is from a temporary email provider." />
            <DetailItem label="Catch-All" value={<BooleanBadge value={data.isCatchAll} />} tooltip="Whether the server accepts all emails to the domain." />
        </CardContent>
    </Card>
);

const BlacklistSection = ({ data }: { data: BlacklistStatus }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Listed on Blacklists" value={<BooleanBadge value={data.isListed} />} />
            <DetailItem label="Blacklist Sources" value={data.sources.length > 0 ? data.sources.join(', ') : 'None'} />
        </CardContent>
    </Card>
);

const ThreatIntelligenceSection = ({ data }: { data: ThreatIntelligenceReport }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Known Threat" value={<BooleanBadge value={data.isKnownThreat} />} />
            <DetailItem label="Threat Types" value={data.threatTypes.length > 0 ? data.threatTypes.join(', ') : 'None'} />
        </CardContent>
    </Card>
);

const HistoricalDataSection = ({ data }: { data: HistoricalData }) => (
    <Card className="bg-background/50">
        <CardContent className="p-4">
            <DetailItem label="Ownership Changes" value={data.changes} />
            <DetailItem label="Last Change Date" value={data.lastChangeDate} />
        </CardContent>
    </Card>
);
