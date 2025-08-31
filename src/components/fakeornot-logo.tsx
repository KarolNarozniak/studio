import { Shapes } from "lucide-react";
import { cn } from "@/lib/utils";

type FakeOrNotLogoProps = React.HTMLAttributes<SVGSVGElement>;

export default function FakeOrNotLogo({ className, ...props }: FakeOrNotLogoProps) {
  return (
    <Shapes
      className={cn("text-primary", className)}
      strokeWidth={1.5}
      {...props}
    />
  );
}
