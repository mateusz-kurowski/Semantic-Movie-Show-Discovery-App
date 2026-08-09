"use client";
import { use } from "react";
import MovieDetailsLayout from "./_components/MovieDetailsLayout";

const page = ({ params }: { params: Promise<{ movieId: string }> }) => {
	const { movieId } = use(params);
	return <MovieDetailsLayout movieId={movieId} />;
};

export default page;
