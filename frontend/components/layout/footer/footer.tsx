import Logo from "../shared/logo";
import FooterLink from "./foter-link";

const footer = () => {
	return (
		<footer className="mt-auto flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-6 text-center sm:px-6 md:flex-row md:gap-0 md:text-left lg:px-8">
			<Logo size="xl" />

			<ul className="list-style-none flex flex-wrap justify-center gap-3">
				<FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
				<FooterLink href="/terms-of-service">Terms of Service</FooterLink>
				<FooterLink href="/api-support">API Support</FooterLink>
			</ul>
			<div className="text-sm text-outline">
				© 2024 ReelFind. Cinematic Discovery.
			</div>
		</footer>
	);
};

export default footer;
