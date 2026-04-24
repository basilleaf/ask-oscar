import { config } from "dotenv";
config({ path: ".env" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { passages } from "../db/schema";
import { VoyageAIClient } from "voyageai";

// npx tsx scripts/seed.ts

const WORKS = [
  {
    title: "The Importance of Being Earnest",
    gutenbergId: 844,
    file: "844-0.txt",
  },
  { title: "An Ideal Husband", gutenbergId: 885, file: "885-0.txt" },
  { title: "Lady Windermere's Fan", gutenbergId: 790, file: "790-0.txt" },
  { title: "A Woman of No Importance", gutenbergId: 854, file: "854-0.txt" },
  { title: "The Picture of Dorian Gray", gutenbergId: 174, file: "174-0.txt" },
  {
    title: "The Soul of Man Under Socialism",
    gutenbergId: 1017,
    file: "1017-0.txt",
  },
  { title: "De Profundis", gutenbergId: 921, file: "921.txt" },
  {
    title: "The Happy Prince and Other Tales",
    gutenbergId: 902,
    file: "902-0.txt",
  },
];

const BATCH_SIZE = 64;
const SLEEP_MS = 5000; // 5 seconds between batches, well under 2000 RPM

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! });

const stripGutenberg = (text: string): string => {
  const normalized = text.replace(/\r\n/g, "\n");
  const start = normalized.indexOf("*** START OF");
  const end = normalized.indexOf("*** END OF");
  if (start === -1 || end === -1) return normalized;
  const body = normalized
    .slice(normalized.indexOf("\n", start) + 1, end)
    .trim();

  // Skip past table of contents (for Dorian Gray etc.)
  const chapterMatch = body.match(/CHAPTER\s+I[\.\s]*\n+[A-Z][a-z]/);
  if (chapterMatch?.index && chapterMatch.index < 3000) {
    return body.slice(chapterMatch.index).trim();
  }

  return body;
};

const chunkText = (text: string): string[] => {
  return text
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 100 && p.length < 1500) // lower min for Wilde's short epigrams
    .filter((p) => !p.match(/^ACT\s/i))
    .filter((p) => !p.match(/^SCENE\s/i))
    .filter((p) => !p.match(/^\[/))
    .filter((p) => !p.match(/^Note: Project Gutenberg/))
    .filter((p) => !p.match(/^METHUEN/))
    .filter((p) => !p.match(/^This eBook is for the use of/))
    .filter((p) => !p.match(/^_First Edition_/))
    .filter((p) => !p.match(/^John Worthing/)) // Earnest cast list
    .filter((p) => !p.match(/^_First (Published|Printed|Issued|Edition)/)) // edition history blocks
    .filter((p) => !p.match(/^Transcribed from/)) // De Profundis transcription note
    .filter((p) => !p.match(/^Page The Happy Prince/))
    .filter((p) => !p.match(/^THE EARL OF|^VISCOUNT|^SIR ROBERT/)) // An Ideal Husband cast
    .filter((p) => !p.match(/^_The (literary|dramatic) rights/)) // rights notices // Happy Prince TOC
    .filter((p) => !p.match(/^LORD ILLINGWORTH|^SIR JOHN PONTEFRACT/)) // Woman cast
    .filter((p) => !p.match(/belong to Sir George Alexander/)) // Windermere rights
    .filter((p) => !p.match(/^TO\s+THE DEAR MEMORY/));
};

const gutenbergUrl = (id: number, file: string) =>
  `https://www.gutenberg.org/files/${id}/${file}`;

const fetchWork = async (id: number, file: string) => {
  const response = await fetch(gutenbergUrl(id, file));
  return response.text();
};

const embedBatch = async (texts: string[]): Promise<number[][]> => {
  const result = await voyage.embed({
    input: texts,
    model: "voyage-3",
  });
  return (result.data ?? [])
    .map((d) => d.embedding)
    .filter((embedding): embedding is number[] => Array.isArray(embedding));
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seed = async () => {
  for (const work of WORKS) {
    console.log(`\nProcessing ${work.title}...`);
    const text = await fetchWork(work.gutenbergId, work.file);
    const stripped = stripGutenberg(text);
    const chunks = chunkText(stripped);
    console.log(`  ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(batch);

      await db.insert(passages).values(
        batch.map((text, j) => ({
          novel: work.title,
          text,
          charCount: text.length,
          embedding: embeddings[j],
        })),
      );

      console.log(
        `  inserted ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length}`,
      );
      await sleep(SLEEP_MS);
    }

    console.log(`  ✓ ${work.title} done`);
  }

  console.log("\n✓ All works seeded!");
};

seed();
