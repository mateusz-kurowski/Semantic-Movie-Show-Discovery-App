interface LogoProps {
	size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
	className?: string;
}

const sizeClasses: Record<NonNullable<LogoProps["size"]>, string> = {
	xs: "text-xs",
	sm: "text-sm",
	base: "text-base",
	lg: "text-lg",
	xl: "text-xl",
	"2xl": "text-2xl",
	"3xl": "text-3xl",
	"4xl": "text-4xl",
};

function Logo({ size = "4xl", className }: LogoProps) {
	return (
		<div
			className={`font-bold tracking-[-0.02em] text-on-surface ${sizeClasses[size]} ${className || ""}`}
		>
			Reel<span className="text-primary">Find</span>
		</div>
	);
}

export default Logo;
