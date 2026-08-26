"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
		<header className="bg-surface-bright py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
			<Link href="/">
				<Logo size="2xl" className="sm:text-4xl" />
			</Link>
			<Nav />

			{session?.user ? (
				<div className="flex items-center gap-2 sm:gap-4">
					<Tooltip>
						<TooltipTrigger
							render={
								<Button
									onClick={() => authClient.signOut()}
									variant="outline"
									size="icon"
									className="hidden sm:inline-flex cursor-pointer"
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
						<Skeleton className="h-10 w-10 rounded-full" />
					) : (
						<Link href="/profile">
							<Avatar>
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
				<ButtonGroup aria-label="Authentication buttons">
					<Link
						href={"/sign-in"}
						className={buttonVariants({ variant: "link" })}
					>
						Sign In
					</Link>
					<Link
						href={"/sign-up"}
						className={buttonVariants({
							variant: "default",
							className: "rounded-sm",
						})}
					>
						Sign Up
					</Link>
				</ButtonGroup>
			)}
		</header>
	);
}

export default Header;
