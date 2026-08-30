"use client";

import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";

const ProfilePageLayout = () => {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const { image, name, email } = session?.user || {};

	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	if (isPending) {
		return (
			<div className="flex flex-1 flex-col items-center gap-4 px-4 py-16">
				<Skeleton className="size-20 rounded-full" />
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-56" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<EmptyState
				icon={UserRound}
				title="You're not signed in"
				description="Sign in to see your profile."
			/>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-115 flex-1 flex-col items-center gap-5 px-4 py-16 text-center">
			<Avatar size="lg" className="ring-1 ring-foreground/12">
				<AvatarImage src={image!} alt={name} />
				<AvatarFallback>
					{name
						?.split(" ")
						.map((n) => n[0])
						.join("")}
				</AvatarFallback>
			</Avatar>
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl leading-8 font-bold tracking-[-0.03em]">
					{name}
				</h1>
				<p className="text-on-surface-variant">{email}</p>
			</div>
			<Button
				onClick={handleSignOut}
				variant="outline"
				className="h-10 cursor-pointer rounded-full px-4"
			>
				<LogOut /> Sign Out
			</Button>
		</div>
	);
};

export default ProfilePageLayout;
