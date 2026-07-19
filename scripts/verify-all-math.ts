import { config } from "dotenv";
import { createSupabaseAdmin } from "../lib/supabase/puzzles";

config({ path: ".env.local" });

async function main() {
  const supabase = createSupabaseAdmin();

  const { data: before, error: readError } = await supabase
    .from("puzzles")
    .select("title, status")
    .eq("category", "math");

  if (readError) throw readError;

  const { data, error } = await supabase
    .from("puzzles")
    .update({ status: "verified" })
    .eq("category", "math")
    .select("title, status");

  if (error) throw error;

  console.log(`數學題共 ${before?.length ?? 0} 題，已全部改為已上架（verified）`);
  data?.forEach((row) => console.log(`  ✓ ${row.title}`));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
