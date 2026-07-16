interface LogoProps {
	size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

function Logo({ size = "4xl" }: LogoProps) {
	return <div className={`text-primary font-bold text-${size}`}>ReelFind</div>;
}

export default Logo;
