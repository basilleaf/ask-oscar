"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Cinzel_Decorative,
  Cormorant_Garamond,
  IM_Fell_English,
} from "next/font/google";
import Link from "next/link";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const imFell = IM_Fell_English({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

type SearchPassage = {
  id: number;
  novel: string;
  text: string;
  similarity: number;
};

type SearchResponse = {
  summary: string;
  passages: SearchPassage[];
};

const SUGGESTED_QUERIES = [
  "hypocrisy",
  "vanity",
  "beauty",
  "individualism",
  "first impressions",
  "decadence & hedonism",
  "social obligation",
  "moral and ethical dilemmas",
  "social class and class mobility",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  const resetSearchState = () => {
    setResult(null);
    setError(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("slug");
    const paramsString = params.toString();
    const nextUrl = paramsString
      ? `${window.location.pathname}?${paramsString}`
      : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  };

  const runSearch = async (rawQuery: string) => {
    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Search failed. Please try again.");
      }

      setResult(data as SearchResponse);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug")?.trim();
    if (!slug) return;

    setQuery(slug);
    void runSearch(slug);
  }, []);

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const params = new URLSearchParams(window.location.search);
    params.set("slug", trimmedQuery);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);

    await runSearch(trimmedQuery);
  };

  const onSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    const params = new URLSearchParams(window.location.search);
    params.set("slug", suggestion);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
    void runSearch(suggestion);
  };

  const onQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    if (!nextQuery.trim()) {
      resetSearchState();
    }
  };

  const onClearQuery = () => {
    setQuery("");
    resetSearchState();
  };

  return (
    <div
      className={`min-h-screen bg-[#16102e] text-[#f5f0e8] ${cormorant.className}`}
    >
      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col px-6 py-12 sm:px-10 lg:py-20">
        <div className="fixed right-[20px] top-[12px]">
          <Link
            href="/about"
            className={`${cinzel.className} text-[0.65rem] uppercase tracking-[0.25em] text-[#d4ac5a] transition hover:text-[#f5f0e8]`}
          >
            About
          </Link>
        </div>
        <header className="mx-auto mb-10 w-full max-w-4xl border-b border-[#b8922a]/25 pb-8">
          <p
            className={`${cinzel.className} mb-4 text-[0.65rem] uppercase tracking-[0.35em] text-[#b8922a]`}
          >
            Thematic Search
          </p>
          <h1
            className={`${cinzel.className} text-4xl text-[#f5f0e8] sm:text-6xl`}
          >
            Oscar <span className="italic text-[#d4ac5a]">Wilde</span>
          </h1>
          <p
            className={`${imFell.className} mt-4 max-w-2xl text-lg italic text-[#d4ac5a]`}
          >
            Search the works by theme, feeling, or question.
          </p>
        </header>

        <main className="space-y-8">
          <form
            onSubmit={onSearch}
            className="mx-auto w-full max-w-4xl rounded-2xl border border-[#b8922a]/30 bg-[#0a0818]/60 p-5 shadow-[0_0_60px_rgba(184,146,42,0.08)] sm:p-7"
          >
            <label
              htmlFor="themeQuery"
              className={`${cinzel.className} mb-3 block text-xs uppercase tracking-[0.25em] text-[#b8922a]`}
            >
              Your query
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full">
                <input
                  id="themeQuery"
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="e.g. vanity, beauty, hypocrisy, decadence"
                  className="w-full rounded-xl border border-[#b8922a]/40 bg-[#16102e] px-4 py-3 pr-10 text-lg text-[#f5f0e8] outline-none placeholder:text-[#f5f0e8]/45 focus:border-[#d4ac5a] focus:ring-2 focus:ring-[#d4ac5a]/40"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={onClearQuery}
                    aria-label="Clear search"
                    className="absolute inset-y-0 right-2 flex w-12 items-center justify-center p-2 text-3xl leading-none font-semibold text-[#f5f0e8]/75 transition hover:text-[#f5f0e8] sm:right-3"
                  >
                    <span className="translate-y-[-3px]">×</span>
                  </button>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className={`${cinzel.className} rounded-xl border border-[#b8922a] bg-[#b8922a] px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#0a0818] transition hover:bg-[#d4ac5a] disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
              {SUGGESTED_QUERIES.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSuggestionClick(suggestion)}
                  disabled={loading}
                  className={`${imFell.className} rounded-sm border border-[#b8922a]/35 bg-[#16102e]/75 px-4 py-2 text-xl italic text-[#e5dccb]/85 transition hover:border-[#d4ac5a]/80 hover:text-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
              {SUGGESTED_QUERIES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSuggestionClick(suggestion)}
                  disabled={loading}
                  className={`${imFell.className} rounded-sm border border-[#b8922a]/35 bg-[#16102e]/75 px-4 py-2 text-xl italic text-[#e5dccb]/85 transition hover:border-[#d4ac5a]/80 hover:text-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>

          {error ? (
            <div className="rounded-xl border border-[#5a1a4a]/60 bg-[#5a1a4a]/20 p-4 text-[#f5f0e8]">
              {error}
            </div>
          ) : null}

          {result ? (
            <section className="space-y-6">
              <div className="mx-auto w-full max-w-4xl rounded-2xl border border-[#b8922a]/35 bg-[#0e0b1c]/70 p-6">
                <p
                  className={`${cinzel.className} mb-2 text-xs uppercase tracking-[0.25em] text-[#b8922a]`}
                >
                  AI Summary
                </p>
                <p className="text-lg leading-8 text-[#f5f0e8]/90">
                  {result.summary}
                </p>
              </div>

              <div className="mx-auto w-full max-w-4xl space-y-4">
                <p
                  className={`${cinzel.className} text-xs uppercase tracking-[0.25em] text-[#b8922a]`}
                >
                  Supporting Passages
                </p>
                {result.passages.map((passage) => (
                  <article
                    key={passage.id}
                    className="rounded-xl border border-[#b8922a]/25 bg-[#0a0818]/70 p-5"
                  >
                    <p
                      className={`${imFell.className} mb-3 text-lg italic text-[#d4ac5a]`}
                    >
                      {passage.novel}
                    </p>
                    <p className="text-lg leading-8 text-[#f5f0e8]/90">
                      {passage.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
