import Logo from "../shared/logo";
import FooterLink from "./foter-link";

const footer = () => {
  return (
    <footer className="flex items-center justify-between ps-4">
      <Logo size="2xl" />

      <ul className="flex gap-3 text-surface-bright list-style-none">
        <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
        <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
        <FooterLink href="/api-support">API Support</FooterLink>
      </ul>
      <div className="text-secondary">
        © 2024 ReelFind. Cinematic Discovery.
      </div>
    </footer>
  );
};

export default footer;
