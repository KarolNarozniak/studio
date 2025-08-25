import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type TrustCheckLogoProps = React.HTMLAttributes<SVGSVGElement>;

export default function TrustCheckLogo({ className, ...props }: TrustCheckLogoProps) {
  return (
    <ShieldCheck
      className={cn("text-primary", className)}
      strokeWidth={1.5}
      {...props}
    />
  );
}
