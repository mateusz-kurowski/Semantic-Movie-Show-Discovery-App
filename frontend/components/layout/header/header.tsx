"use client";
import { DoorClosed } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { authClient } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import Logo from "../shared/logo";
import Nav from "./nav";

function Header() {
	const { data: session, isPending } = authClient.useSession();
	const { image, name } = session?.user || {};

	return (
		<header className=" bg-surface-bright py-3 px-8 flex items-center justify-between">
			<Link href="/">
				<Logo size="4xl" />
			</Link>
			<Nav />

			{session?.user ? (
				<div className="flex items-center gap-4">
					<Button
						onClick={() => authClient.signOut()}
						variant="outline"
						size="icon"
					>
						<DoorClosed />
					</Button>
					<Avatar>
						<AvatarImage src={image!} alt={name} />
						<AvatarFallback>Profile</AvatarFallback>
					</Avatar>
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
