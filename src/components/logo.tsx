import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
}
export const Logo = ({ className }: LogoProps) => {
  return (
    <Link
      href="/"
      className={cn("flex items-center", className)}
    >
      <img
        src="/logo-uin.png"
        alt="/logo-uin"
      />
    </Link>
  );
};
