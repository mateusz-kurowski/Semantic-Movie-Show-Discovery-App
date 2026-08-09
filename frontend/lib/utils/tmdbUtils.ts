export const getTmdbImageUrl = (
	path: string,
	size: "w500" | "original" = "w500",
) => {
	return `https://image.tmdb.org/t/p/${size}${path}`;
};
