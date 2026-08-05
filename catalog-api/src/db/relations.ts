import { relations } from "drizzle-orm";
import {
	account,
	session,
	user,
	usermoviefavorite,
	usermovierating,
	usermoviewatchlist,
} from "./auth-schema";
import {
	company,
	country,
	genre,
	keyword,
	language,
	movie,
	moviecompanylink,
	moviecountrylink,
	moviegenrelink,
	moviekeywordlink,
	movielanguagelink,
} from "./catalog-schema";

// Auth relations
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	favorites: many(usermoviefavorite),
	watchlists: many(usermoviewatchlist),
	ratings: many(usermovierating),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const usermoviefavoriteRelations = relations(
	usermoviefavorite,
	({ one }) => ({
		user: one(user, {
			fields: [usermoviefavorite.userId],
			references: [user.id],
		}),
		movie: one(movie, {
			fields: [usermoviefavorite.movieId],
			references: [movie.id],
		}),
	}),
);

export const usermoviewatchlistRelations = relations(
	usermoviewatchlist,
	({ one }) => ({
		user: one(user, {
			fields: [usermoviewatchlist.userId],
			references: [user.id],
		}),
		movie: one(movie, {
			fields: [usermoviewatchlist.movieId],
			references: [movie.id],
		}),
	}),
);

export const usermovieratingRelations = relations(
	usermovierating,
	({ one }) => ({
		user: one(user, {
			fields: [usermovierating.userId],
			references: [user.id],
		}),
		movie: one(movie, {
			fields: [usermovierating.movieId],
			references: [movie.id],
		}),
	}),
);

// Catalog junction table relations
export const moviecompanylinkRelations = relations(
	moviecompanylink,
	({ one }) => ({
		company: one(company, {
			fields: [moviecompanylink.companyId],
			references: [company.id],
		}),
		movie: one(movie, {
			fields: [moviecompanylink.movieId],
			references: [movie.id],
		}),
	}),
);

export const moviecountrylinkRelations = relations(
	moviecountrylink,
	({ one }) => ({
		country: one(country, {
			fields: [moviecountrylink.countryId],
			references: [country.id],
		}),
		movie: one(movie, {
			fields: [moviecountrylink.movieId],
			references: [movie.id],
		}),
	}),
);

export const moviegenrelinkRelations = relations(moviegenrelink, ({ one }) => ({
	genre: one(genre, {
		fields: [moviegenrelink.genreId],
		references: [genre.id],
	}),
	movie: one(movie, {
		fields: [moviegenrelink.movieId],
		references: [movie.id],
	}),
}));

export const moviekeywordlinkRelations = relations(
	moviekeywordlink,
	({ one }) => ({
		keyword: one(keyword, {
			fields: [moviekeywordlink.keywordId],
			references: [keyword.id],
		}),
		movie: one(movie, {
			fields: [moviekeywordlink.movieId],
			references: [movie.id],
		}),
	}),
);

export const movielanguagelinkRelations = relations(
	movielanguagelink,
	({ one }) => ({
		language: one(language, {
			fields: [movielanguagelink.languageId],
			references: [language.id],
		}),
		movie: one(movie, {
			fields: [movielanguagelink.movieId],
			references: [movie.id],
		}),
	}),
);

// Entity relations (through junction tables)
export const companyRelations = relations(company, ({ many }) => ({
	moviecompanylinks: many(moviecompanylink),
}));

export const countryRelations = relations(country, ({ many }) => ({
	moviecountrylinks: many(moviecountrylink),
}));

export const genreRelations = relations(genre, ({ many }) => ({
	moviegenrelinks: many(moviegenrelink),
}));

export const keywordRelations = relations(keyword, ({ many }) => ({
	moviekeywordlinks: many(moviekeywordlink),
}));

export const languageRelations = relations(language, ({ many }) => ({
	movielanguagelinks: many(movielanguagelink),
}));

export const movieRelations = relations(movie, ({ many }) => ({
	moviecompanylinks: many(moviecompanylink),
	moviecountrylinks: many(moviecountrylink),
	moviegenrelinks: many(moviegenrelink),
	moviekeywordlinks: many(moviekeywordlink),
	movielanguagelinks: many(movielanguagelink),
	favorites: many(usermoviefavorite),
	watchlists: many(usermoviewatchlist),
	ratings: many(usermovierating),
}));
