import Link from "next/link";
import {
  Cinzel_Decorative,
  Cormorant_Garamond,
  IM_Fell_English,
} from "next/font/google";

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

const WORKS = [
  "The Importance of Being Earnest",
  "An Ideal Husband",
  "Lady Windermere's Fan",
  "A Woman of No Importance",
  "The Picture of Dorian Gray",
  "The Soul of Man Under Socialism",
  "De Profundis",
  "The Happy Prince and Other Tales",
];

export default function AboutPage() {
  return (
    <div
      className={`min-h-screen bg-[#16102e] text-[#f5f0e8] ${cormorant.className}`}
    >
      <div className="relative mx-auto w-full max-w-[1100px] px-6 py-12 sm:px-10 lg:py-20">
        <div className="fixed right-[20px] top-[12px]">
          <Link
            href="/"
            className={`${cinzel.className} text-[0.65rem] uppercase tracking-[0.25em] text-[#d4ac5a] transition hover:text-[#f5f0e8]`}
          >
            Home
          </Link>
        </div>

        <article className="mx-auto max-w-4xl rounded-2xl border border-[#b8922a]/30 bg-[#0a0818]/60 p-6 sm:p-8">
          <p
            className={`${cinzel.className} mb-4 text-[0.65rem] uppercase tracking-[0.35em] text-[#b8922a]`}
          >
            About
          </p>
          <h1
            className={`${cinzel.className} text-4xl text-[#f5f0e8] sm:text-5xl`}
          >
            About this project
          </h1>
          <p
            className={`${imFell.className} mt-5 text-xl leading-8 text-[#d4ac5a]`}
          >
            This app explores recurring themes in Oscar Wilde's writing with
            semantic search and passage-level retrieval.
          </p>
          <p className="mt-6 text-lg leading-8 text-[#f5f0e8]/90">
            The text corpus was sourced from the{" "}
            <a
              href="https://www.gutenberg.org/"
              className="text-[#d4ac5a] underline decoration-[#d4ac5a]/70 underline-offset-4 transition hover:text-[#f5f0e8] hover:decoration-[#f5f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ac5a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16102e]"
            >
              Project Gutenberg
            </a>{" "}
            and processed into searchable passages, summarized with Anthropic's
            Claude.
          </p>

          <section className="mt-8">
            <h2
              className={`${cinzel.className} text-xs uppercase tracking-[0.25em] text-[#b8922a]`}
            >
              Works included
            </h2>
            <ul className="mt-4 space-y-2 text-lg leading-8 text-[#f5f0e8]/90">
              {WORKS.map((work) => (
                <li
                  key={work}
                  className="list-inside list-disc marker:text-[#d4ac5a]"
                >
                  {work}
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
