"use client";

import type { LucideIcon } from "lucide-react";
import { Bookmark, Clock, Compass } from "lucide-react";
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
	{ href: "/watchlist", label: "Watchlist", icon: Bookmark },
	{ href: "/history", label: "History", icon: Clock },
];

const BottomNav = () => {
	const pathname = usePathname();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-50 flex md:hidden items-center justify-around h-16 border-t border-border bg-surface-container-low">
			{items.map(({ href, label, icon: Icon }) => {
				const isActive =
					href === "/" ? pathname === href : pathname.startsWith(href);

				return (
					<Link
						key={href}
						href={href}
						className={cn(
							"flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs",
							isActive ? "text-primary" : "text-on-surface-variant",
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
