"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import Logo from "../shared/logo";
import Nav from "./nav";

function Header() {
	const { data: session, isPending } = authClient.useSession();
	const { image, name } = session?.user || {};

	return (
		<header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-surface-container-lowest/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
			<div className="flex items-center gap-6 md:gap-10">
				<Link href="/">
					<Logo size="xl" />
				</Link>
				<Nav />
			</div>

			{session?.user ? (
				<div className="flex items-center gap-2 sm:gap-4">
					<Tooltip>
						<TooltipTrigger
							render={
								<Button
									onClick={() => authClient.signOut()}
									variant="outline"
									size="icon"
									className="hidden cursor-pointer rounded-full sm:inline-flex"
								>
									<LogOut />
								</Button>
							}
						></TooltipTrigger>
						<TooltipContent>
							<p>Sign Out</p>
						</TooltipContent>
					</Tooltip>
					{isPending ? (
						<Skeleton className="h-8 w-8 rounded-full" />
					) : (
						<Link href="/profile">
							<Avatar className="size-8 ring-1 ring-foreground/12">
								<AvatarImage src={image!} alt={name} />
								<AvatarFallback>
									{name
										?.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
						</Link>
					)}
				</div>
			) : (
				<div className="flex items-center gap-2" aria-label="Authentication">
					<Link
						href={"/sign-in"}
						className={buttonVariants({
							variant: "ghost",
							className: "h-9 rounded-full px-3 text-on-surface-variant",
						})}
					>
						Sign In
					</Link>
					<Link
						href={"/sign-up"}
						className={buttonVariants({
							variant: "default",
							className: "h-9 rounded-full px-4 font-semibold",
						})}
					>
						Sign Up
					</Link>
				</div>
			)}
		</header>
	);
}

export default Header;
