import Link from "next/link";
import { Button } from "@/components/ui/button";

const FooterLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <li>
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <Button
          variant="link"
          className="text-surface-bright hover:underline cursor-pointer"
        >
          {children}
        </Button>
      </Link>
    </li>
  );
};

export default FooterLink;
