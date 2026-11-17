import { redirect } from "next/navigation";
import { DEFAULT_UNIVERSE_SLUG } from "@/lib/world/universes";

/** 舊連結 /galaxy → 中年級宇宙 */
export default function GalaxyIndexPage() {
  redirect(`/universe/${DEFAULT_UNIVERSE_SLUG}`);
}
