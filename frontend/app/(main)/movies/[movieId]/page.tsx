import MovieDetailsLayout from "./_components/MovieDetailsLayout";

const Page = async ({ params }: { params: Promise<{ movieId: string }> }) => {
	const { movieId } = await params;
	return <MovieDetailsLayout movieId={movieId} />;
};

export default Page;
