import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";
import type { Ingredient, MacroResult, RecipeSummary, SavedRecipe } from "@/types";

const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "cookbook.db");

declare global {
  var __cookbookDb: Database.Database | undefined;
}

function getDb(): Database.Database {
  if (global.__cookbookDb) return global.__cookbookDb;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      macros TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  global.__cookbookDb = db;
  return db;
}

type RecipeRow = {
  id: string;
  slug: string;
  name: string;
  ingredients: string;
  macros: string;
  created_at: string;
};

function rowToRecipe(row: RecipeRow): SavedRecipe {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ingredients: JSON.parse(row.ingredients),
    macros: JSON.parse(row.macros),
    createdAt: row.created_at,
  };
}

export function createRecipe(
  name: string,
  ingredients: Ingredient[],
  macros: MacroResult
): SavedRecipe {
  const db = getDb();
  const insert = db.prepare(
    `INSERT INTO recipes (id, slug, name, ingredients, macros) VALUES (?, ?, ?, ?, ?)`
  );

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = nanoid();
    const slug = nanoid(8);
    try {
      insert.run(id, slug, name, JSON.stringify(ingredients), JSON.stringify(macros));
      return getRecipeBySlug(slug)!;
    } catch (err) {
      const isUniqueViolation =
        err instanceof Error && err.message.includes("UNIQUE constraint failed");
      if (!isUniqueViolation || attempt === 4) throw err;
    }
  }
  throw new Error("Failed to generate a unique slug");
}

export function getRecipeBySlug(slug: string): SavedRecipe | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM recipes WHERE slug = ?`).get(slug) as
    | RecipeRow
    | undefined;
  return row ? rowToRecipe(row) : null;
}

export function listRecipes(limit = 50): RecipeSummary[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM recipes ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as RecipeRow[];
  return rows.map((row) => {
    const macros = JSON.parse(row.macros) as MacroResult;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      createdAt: row.created_at,
      totals: macros.totals,
    };
  });
}
