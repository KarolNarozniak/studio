import Image from "next/image";
import { cn } from "@/lib/utils";

type FakeOrNotLogoProps = {
  className?: string;
};

export default function FakeOrNotLogo({ className, ...props }: FakeOrNotLogoProps) {
  return (
    <Image
        src="https://i.ibb.co/0pztWx45/nglt-logo-background.png"
        alt="North Gate Logistics Logo"
        width={48}
        height={48}
        className={cn("rounded-full", className)}
        {...props}
    />
  );
}
