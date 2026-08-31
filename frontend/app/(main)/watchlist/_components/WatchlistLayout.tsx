"use client";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Frown } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/empty-state";
import MoviesGrid from "@/components/shared/movies-grid";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { watchlistService } from "@/lib/api/watchlist";
import { authClient } from "@/lib/auth/auth-client";

const WatchlistLayout = () => {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	const { data, isPending, isError, error } = useQuery({
		enabled: !!session?.user,
		queryFn: watchlistService.getWatchlist,
		queryKey: ["watchlist"],
	});

	if (isSessionPending) {
		return (
			<main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
				<Skeleton className="h-9 w-40 rounded-full" />
			</main>
		);
	}

	if (!session?.user) {
		return (
			<main className="flex flex-1 flex-col">
				<EmptyState
					icon={Bookmark}
					title="Sign in to see your watchlist"
					description="Your watchlist lives on your own server, tied to your account."
				/>
				<div className="flex justify-center pb-16">
					<Link
						href="/sign-in"
						className={buttonVariants({
							className: "h-11 rounded-full px-6 font-semibold",
						})}
					>
						Sign In
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
			<h1 className="text-2xl leading-8 font-bold tracking-[-0.03em] sm:text-3xl">
				Watchlist
			</h1>

			{isPending && (
				<div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
					{Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton key={key} className="aspect-[2/3] w-full rounded-2xl" />
					))}
				</div>
			)}

			{isError && (
				<EmptyState
					icon={Frown}
					title="Couldn't load your watchlist"
					description={error.message}
				/>
			)}

			{data?.length === 0 && (
				<EmptyState
					icon={Bookmark}
					title="Your watchlist is empty"
					description="Movies and shows you save will show up here."
				/>
			)}

			{data && data.length > 0 && <MoviesGrid movies={data} />}
		</main>
	);
};

export default WatchlistLayout;
