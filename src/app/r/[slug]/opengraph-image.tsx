import { ImageResponse } from "next/og";
import { getRecipeBySlug } from "@/lib/db";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  const name = recipe?.name ?? "Recipe";
  const totals = recipe?.macros.totals ?? { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

  const stats: [string, string][] = [
    ["Calories", `${totals.calories}`],
    ["Protein", `${totals.protein_g}g`],
    ["Carbs", `${totals.carbs_g}g`],
    ["Fat", `${totals.fat_g}g`],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#111827" }}>
          {name}
        </div>
        <div style={{ display: "flex", marginTop: 56, gap: 64 }}>
          {stats.map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#111827" }}>
                {value}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginTop: 8,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
