CREATE TABLE "passages" (
	"id" serial PRIMARY KEY NOT NULL,
	"novel" text NOT NULL,
	"chapter" integer,
	"chapter_title" text,
	"text" text NOT NULL,
	"char_count" integer,
	"embedding" vector(1024),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"summary" text NOT NULL,
	"passages" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "searches_query_unique" UNIQUE("query")
);
--> statement-breakpoint
CREATE INDEX "passages_embedding_idx" ON "passages" USING hnsw ("embedding" vector_cosine_ops);