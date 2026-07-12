// Re-exports all tables for type-safe queries.
// Catalog tables — read-only, not in migrations (created by catalog-collector).
// Auth tables — managed by Drizzle migrations.
export * from "./catalog-schema";
export * from "./auth-schema";
