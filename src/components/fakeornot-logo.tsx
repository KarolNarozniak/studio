import Image from "next/image";
import { cn } from "@/lib/utils";

type FakeOrNotLogoProps = {
  className?: string;
};

export default function FakeOrNotLogo({ className, ...props }: FakeOrNotLogoProps) {
  return (
    <div className={cn("relative", className)} {...props}>
        <Image
            src="https://northgatelogistics.pl/wp-content/uploads/2023/01/NGLT-kolko-BIALEsrodek.png"
            alt="North Gate Logistics Logo"
            width={48}
            height={48}
            className="rounded-full"
        />
    </div>
  );
}
