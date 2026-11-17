import { redirect } from "next/navigation";

import { DEFAULT_UNIVERSE_SLUG } from "@/lib/world/universes";



/** 舊連結 /galaxy/[slug] → /universe/grades-3-4/galaxy/[slug] */

export default async function GalaxySlugRedirectPage({

  params,

}: {

  params: Promise<{ slug: string }>;

}) {

  const { slug } = await params;

  redirect(`/universe/${DEFAULT_UNIVERSE_SLUG}/galaxy/${slug}`);

}

