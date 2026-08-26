import Logo from "../shared/logo";
import FooterLink from "./foter-link";

const footer = () => {
	return (
		<footer className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 px-4 sm:px-6 lg:px-8 py-4 text-center md:text-left">
			<Logo size="2xl" />

			<ul className="flex flex-wrap justify-center gap-3 text-surface-bright list-style-none">
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
