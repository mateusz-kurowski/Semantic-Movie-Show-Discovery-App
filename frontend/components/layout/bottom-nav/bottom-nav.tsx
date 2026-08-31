"use client";

import type { LucideIcon } from "lucide-react";
import { Bookmark, Clock, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface BottomNavItem {
	href: string;
	label: string;
	icon: LucideIcon;
}

const items: BottomNavItem[] = [
	{ href: "/", label: "Discover", icon: Compass },
	{ href: "/ask", label: "Ask AI", icon: Sparkles },
	{ href: "/watchlist", label: "Watchlist", icon: Bookmark },
	{ href: "/history", label: "History", icon: Clock },
];

const BottomNav = () => {
	const pathname = usePathname();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border bg-surface-container-lowest/85 backdrop-blur-xl md:hidden">
			{items.map(({ href, label, icon: Icon }) => {
				const isActive =
					href === "/" ? pathname === href : pathname.startsWith(href);

				return (
					<Link
						key={href}
						href={href}
						className={cn(
							"flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
							isActive ? "text-primary" : "text-outline",
						)}
					>
						<Icon className="size-5" />
						{label}
					</Link>
				);
			})}
		</nav>
	);
};

export default BottomNav;
