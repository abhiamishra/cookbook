import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { Ingredient, MacroResult } from "@/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { ingredients }: { ingredients: Ingredient[] } = await req.json();

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
  }

  const ingredientList = ingredients
    .map((i) => `- ${i.amount} ${i.unit} ${i.name}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a nutrition expert. Given this list of ingredients, return accurate macro estimates as JSON.

Ingredients:
${ingredientList}

Return ONLY valid JSON in this exact format, no markdown, no other text:
{
  "items": [
    { "name": "ingredient name", "amount": "amount value", "unit": "unit", "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 }
  ],
  "totals": { "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 }
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const result: MacroResult = JSON.parse(text);
  return NextResponse.json(result);
}
