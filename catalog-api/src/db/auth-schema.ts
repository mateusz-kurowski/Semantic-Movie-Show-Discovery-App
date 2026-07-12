// Auth tables managed by Drizzle migrations.
// Tables here will be created/updated via `drizzle-kit migrate`.
//
// Catalog tables (movie, genre, etc.) live in catalog-schema.ts
// and are NOT managed by migrations — they're created by catalog-collector.
//
// Populate this file when integrating better-auth.
// better-auth's Drizzle adapter will add:
//   - user, session, account, verification
//
// Add user-movie relation tables here too:
//   - user_favorite, user_watchlist, user_rating, etc.
export {};
