"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

const HeaderNavElement = (props: PropsWithChildren<{ href: string }>) => {
	const pathname = usePathname();
	const isActive =
		props.href === "/"
			? pathname === props.href
			: pathname.startsWith(props.href);

	return (
		<li>
			<Link
				href={props.href}
				className={cn(
					"inline-flex h-16 items-center border-b-2 text-sm font-medium transition-colors",
					isActive
						? "border-primary text-on-surface"
						: "border-transparent text-outline hover:text-on-surface",
				)}
			>
				{props.children}
			</Link>
		</li>
	);
};

export default HeaderNavElement;
