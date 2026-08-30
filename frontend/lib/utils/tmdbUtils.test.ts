import { describe, expect, it } from "vitest";
import { getTmdbImageUrl } from "./tmdbUtils";

describe("getTmdbImageUrl", () => {
	it("defaults to the w500 poster size", () => {
		expect(getTmdbImageUrl("/poster.jpg")).toBe(
			"https://image.tmdb.org/t/p/w500/poster.jpg",
		);
	});

	it("builds an original-size url for backdrops", () => {
		expect(getTmdbImageUrl("/backdrop.jpg", "original")).toBe(
			"https://image.tmdb.org/t/p/original/backdrop.jpg",
		);
	});
});
