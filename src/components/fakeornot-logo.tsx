import { cn } from "@/lib/utils";

type FakeOrNotLogoProps = React.HTMLAttributes<SVGSVGElement>;

export default function FakeOrNotLogo({ className, ...props }: FakeOrNotLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
      {...props}
    >
      <path d="M12 2L7 11H17L12 2Z" />
      <rect x="4" y="13" width="8" height="8" rx="1" />
      <circle cx="16" cy="17" r="4" />
    </svg>
  );
}
