interface LogoProps {
	size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
	className?: string;
}

function Logo({ size = "4xl", className }: LogoProps) {
	return (
		<div className={`text-primary font-bold text-${size} ${className || ""}`}>
			ReelFind
		</div>
	);
}

export default Logo;
