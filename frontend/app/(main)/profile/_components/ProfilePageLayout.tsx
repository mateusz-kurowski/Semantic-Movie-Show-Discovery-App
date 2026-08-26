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
			<div className="flex flex-col items-center gap-4 py-16 px-4">
				<Skeleton className="size-20 rounded-full" />
				<Skeleton className="h-5 w-40" />
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
		<div className="flex flex-col items-center text-center gap-4 py-16 px-4">
			<Avatar size="lg">
				<AvatarImage src={image!} alt={name} />
				<AvatarFallback>
					{name
						?.split(" ")
						.map((n) => n[0])
						.join("")}
				</AvatarFallback>
			</Avatar>
			<div>
				<h1 className="text-xl font-bold">{name}</h1>
				<p className="text-on-surface-variant">{email}</p>
			</div>
			<Button
				onClick={handleSignOut}
				variant="outline"
				className="cursor-pointer"
			>
				<LogOut /> Sign Out
			</Button>
		</div>
	);
};

export default ProfilePageLayout;
